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

  it('save met à jour le nom du foyer', async () => {
    const adminId = await createUser();
    const h = newHousehold();
    await households.createWithAdmin(
      h,
      HouseholdMember.createAdmin(randomUUID(), adminId, h.id),
    );

    h.rename('Famille Martin');
    await households.save(h);

    expect((await households.findById(h.id))?.name).toBe('Famille Martin');
  });

  it('delete supprime le foyer et ses adhésions en cascade, sans toucher aux autres', async () => {
    const adminId = await createUser();
    const memberId = await createUser();
    const h = newHousehold();
    const other = newHousehold();
    await households.createWithAdmin(
      h,
      HouseholdMember.createAdmin(randomUUID(), adminId, h.id),
    );
    await households.createWithAdmin(
      other,
      HouseholdMember.createAdmin(randomUUID(), adminId, other.id),
    );
    await members.save(
      HouseholdMember.requestToJoin(randomUUID(), memberId, h.id),
    );

    await households.delete(h.id);

    expect(await households.findById(h.id)).toBeNull();
    expect(await members.findByHousehold(h.id)).toHaveLength(0);
    expect(await members.findByUser(memberId)).toHaveLength(0);
    // Les utilisateurs et les autres foyers restent
    expect(
      await dataSource.getRepository(UserOrmEntity).countBy({ id: memberId }),
    ).toBe(1);
    expect(await households.findById(other.id)).not.toBeNull();
    expect(await members.findByUser(adminId)).toHaveLength(1);
  });

  it("setDefault déplace le flag, et l'index partiel refuse deux foyers par défaut", async () => {
    const userId = await createUser();
    const h1 = newHousehold();
    const h2 = newHousehold();
    await households.createWithAdmin(
      h1,
      HouseholdMember.createAdmin(randomUUID(), userId, h1.id, true),
    );
    const second = HouseholdMember.createAdmin(randomUUID(), userId, h2.id);
    await households.createWithAdmin(h2, second);
    expect((await members.findOne(h1.id, userId))?.isDefault).toBe(true);
    expect((await members.findOne(h2.id, userId))?.isDefault).toBe(false);

    await members.setDefault(userId, h2.id);
    expect((await members.findOne(h1.id, userId))?.isDefault).toBe(false);
    expect((await members.findOne(h2.id, userId))?.isDefault).toBe(true);

    // Écrire un 2e flag sans passer par setDefault : refusé par la base.
    const first = (await members.findOne(h1.id, userId))!;
    first.isDefault = true;
    await expect(members.save(first)).rejects.toThrow();
    expect((await members.findOne(h1.id, userId))?.isDefault).toBe(false);
  });

  it('setDefault ne touche pas aux autres utilisateurs', async () => {
    const a = await createUser();
    const b = await createUser();
    const h = newHousehold();
    await households.createWithAdmin(
      h,
      HouseholdMember.createAdmin(randomUUID(), a, h.id, true),
    );
    const other = newHousehold();
    await households.createWithAdmin(
      other,
      HouseholdMember.createAdmin(randomUUID(), b, other.id, true),
    );
    await members.save(
      new HouseholdMember({
        id: randomUUID(),
        userId: b,
        householdId: h.id,
        role: 'member',
        status: 'active',
      }),
    );

    await members.setDefault(b, h.id);

    expect((await members.findOne(h.id, a))?.isDefault).toBe(true);
    expect((await members.findOne(h.id, b))?.isDefault).toBe(true);
    expect((await members.findOne(other.id, b))?.isDefault).toBe(false);
  });

  it('is_default vaut false par défaut, avec un index unique partiel sur user_id', async () => {
    const [column]: { column_default: string; is_nullable: string }[] =
      await dataSource.query(
        `SELECT column_default, is_nullable FROM information_schema.columns
         WHERE table_name = 'household_members' AND column_name = 'is_default'`,
      );
    expect(column).toEqual({ column_default: 'false', is_nullable: 'NO' });
    const [index]: { indexdef: string }[] = await dataSource.query(
      `SELECT indexdef FROM pg_indexes WHERE indexname = 'UQ_household_members_user_default'`,
    );
    expect(index.indexdef).toMatch(
      /UNIQUE INDEX .*\(user_id\) WHERE \(?is_default = true\)?/,
    );
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
