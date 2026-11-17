import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Household } from '../src/domain/entities/household.entity';
import { HouseholdMember } from '../src/domain/entities/household-member.entity';
import { HouseholdCode } from '../src/domain/value-objects/household-code.value-object';
import { UserOrmEntity } from '../src/infrastructure/repositories/postgres/user.orm-entity';
import { HouseholdOrmEntity } from '../src/infrastructure/repositories/postgres/household.orm-entity';
import { HouseholdMemberOrmEntity } from '../src/infrastructure/repositories/postgres/household-member.orm-entity';
import { HouseholdPostgresRepository } from '../src/infrastructure/repositories/postgres/household.postgres.repository';
import { HouseholdMemberPostgresRepository } from '../src/infrastructure/repositories/postgres/household-member.postgres.repository';

// Test d'intégration sur une vraie base Postgres.
// ATTENTION : le schéma est supprimé puis recréé (dropSchema). Ne jamais pointer
// TEST_DATABASE_URL vers la base de dev ou de prod, utiliser une base jetable, par ex. :
//   docker run -d --rm --name homeez-test-pg -e POSTGRES_PASSWORD=test -p 55432:5432 postgres:16-alpine
//   TEST_DATABASE_URL=postgres://postgres:test@localhost:55432/postgres npm run test:e2e -- household
const url = process.env.TEST_DATABASE_URL;

// @nestjs/typeorm est publié en ESM (avec import.meta), que Jest ne sait pas charger ici.
// On n'utilise pas l'injection Nest dans ce test : le décorateur peut être neutre.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));
const describeDb = url ? describe : describe.skip;

describeDb('Household Postgres repositories (intégration)', () => {
  let dataSource: DataSource;
  let households: HouseholdPostgresRepository;
  let members: HouseholdMemberPostgresRepository;

  const createUser = async (): Promise<string> => {
    const user = new UserOrmEntity();
    user.id = randomUUID();
    user.email = `${user.id}@test.local`;
    user.passwordHash = 'x';
    user.passwordChangedAt = new Date();
    await dataSource.getRepository(UserOrmEntity).save(user);
    return user.id;
  };

  const newHousehold = (code?: string) =>
    new Household({
      id: randomUUID(),
      name: 'Foyer test',
      code: code ? new HouseholdCode(code) : undefined,
    });

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url,
      entities: [UserOrmEntity, HouseholdOrmEntity, HouseholdMemberOrmEntity],
      synchronize: true,
      dropSchema: true,
    });
    await dataSource.initialize();
    households = new HouseholdPostgresRepository(
      dataSource.getRepository(HouseholdOrmEntity),
    );
    members = new HouseholdMemberPostgresRepository(
      dataSource.getRepository(HouseholdMemberOrmEntity),
    );
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('createWithAdmin enregistre le foyer et son admin', async () => {
    const userId = await createUser();
    const h = newHousehold();

    await households.createWithAdmin(
      h,
      HouseholdMember.createAdmin(randomUUID(), userId, h.id),
    );

    const saved = await households.findById(h.id);
    expect(saved?.code.value).toBe(h.code.value);
    expect(saved?.createdAt).toBeInstanceOf(Date);
    expect(await members.countActiveAdmins(h.id)).toBe(1);
  });

  it("rollback : le foyer n'est pas créé si l'insertion de l'admin échoue", async () => {
    const h = newHousehold();
    // Utilisateur inexistant : la clé étrangère fait échouer la 2e insertion.
    const admin = HouseholdMember.createAdmin(randomUUID(), randomUUID(), h.id);

    await expect(households.createWithAdmin(h, admin)).rejects.toThrow();

    expect(await households.findById(h.id)).toBeNull();
    expect(await members.findByHousehold(h.id)).toHaveLength(0);
  });

  it('refuse deux foyers avec le même code', async () => {
    const userId = await createUser();
    const first = newHousehold('QQQ234');
    await households.createWithAdmin(
      first,
      HouseholdMember.createAdmin(randomUUID(), userId, first.id),
    );
    const second = newHousehold('QQQ234');

    await expect(
      households.createWithAdmin(
        second,
        HouseholdMember.createAdmin(randomUUID(), userId, second.id),
      ),
    ).rejects.toThrow();
    expect(await households.findById(second.id)).toBeNull();
  });

  it('refuse deux adhésions pour le même (user_id, household_id)', async () => {
    const adminId = await createUser();
    const userId = await createUser();
    const h = newHousehold();
    await households.createWithAdmin(
      h,
      HouseholdMember.createAdmin(randomUUID(), adminId, h.id),
    );
    await members.save(
      HouseholdMember.requestToJoin(randomUUID(), userId, h.id),
    );

    await expect(
      members.save(HouseholdMember.requestToJoin(randomUUID(), userId, h.id)),
    ).rejects.toThrow();
    expect(await members.findByHousehold(h.id)).toHaveLength(2);
  });

  it('met à jour une adhésion, la supprime, et supprime en cascade avec le compte', async () => {
    const adminId = await createUser();
    const userId = await createUser();
    const h = newHousehold();
    await households.createWithAdmin(
      h,
      HouseholdMember.createAdmin(randomUUID(), adminId, h.id),
    );
    const request = HouseholdMember.requestToJoin(randomUUID(), userId, h.id);
    await members.save(request);

    request.approve();
    await members.save(request);
    expect((await members.findOne(h.id, userId))?.isActive()).toBe(true);
    expect(await members.findByUser(userId)).toHaveLength(1);

    await members.delete(request.id);
    expect(await members.findOne(h.id, userId)).toBeNull();

    await dataSource.getRepository(UserOrmEntity).delete(adminId);
    expect(await members.findByHousehold(h.id)).toHaveLength(0);
  });

  it('les dates sont en timestamptz', async () => {
    const columns: { table_name: string; data_type: string }[] =
      await dataSource.query(
        `SELECT table_name, data_type FROM information_schema.columns
         WHERE table_name IN ('households', 'household_members') AND column_name = 'created_at'`,
      );
    expect(columns).toHaveLength(2);
    columns.forEach((c) =>
      expect(c.data_type).toBe('timestamp with time zone'),
    );
  });
});
