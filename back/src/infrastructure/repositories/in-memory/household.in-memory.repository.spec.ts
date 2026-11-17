import { Household } from '../../../domain/entities/household.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { HouseholdInMemoryRepository } from './household.in-memory.repository';
import { HouseholdMemberInMemoryRepository } from './household-member.in-memory.repository';

const household = (id: string, code = 'ABC234') =>
  new Household({ id, name: 'Foyer', code: new HouseholdCode(code) });

describe('HouseholdInMemoryRepository', () => {
  let members: HouseholdMemberInMemoryRepository;
  let households: HouseholdInMemoryRepository;

  beforeEach(() => {
    members = new HouseholdMemberInMemoryRepository();
    households = new HouseholdInMemoryRepository(members);
  });

  it('createWithAdmin enregistre le foyer et son admin', async () => {
    await households.createWithAdmin(
      household('h1'),
      HouseholdMember.createAdmin('m1', 'u1', 'h1'),
    );

    expect(await households.findById('h1')).not.toBeNull();
    expect(await members.countActiveAdmins('h1')).toBe(1);
  });

  it("createWithAdmin n'enregistre rien si l'écriture de l'admin échoue", async () => {
    // L'adhésion (u1, h1) existe déjà : la 2e écriture viole la contrainte unique.
    await members.save(HouseholdMember.requestToJoin('m0', 'u1', 'h1'));

    await expect(
      households.createWithAdmin(
        household('h1'),
        HouseholdMember.createAdmin('m1', 'u1', 'h1'),
      ),
    ).rejects.toThrow();

    expect(await households.findById('h1')).toBeNull();
    expect(await members.findByHousehold('h1')).toHaveLength(1);
  });

  it("createWithAdmin n'enregistre rien si l'écriture du foyer échoue", async () => {
    await households.save(household('h0', 'ABC234'));

    await expect(
      households.createWithAdmin(
        household('h1', 'ABC234'),
        HouseholdMember.createAdmin('m1', 'u1', 'h1'),
      ),
    ).rejects.toThrow();

    expect(await households.findById('h1')).toBeNull();
    expect(await members.findByHousehold('h1')).toHaveLength(0);
  });

  it('findByCode accepte un code en minuscules et ignore les codes inconnus', async () => {
    await households.save(household('h1', 'ABC234'));
    expect((await households.findByCode('abc234'))?.id).toBe('h1');
    expect(await households.findByCode('ZZZ999')).toBeNull();
  });

  it('findByIds renvoie seulement les foyers demandés', async () => {
    await households.save(household('h1', 'ABC234'));
    await households.save(household('h2', 'ABC235'));
    await households.save(household('h3', 'ABC236'));
    const found = await households.findByIds(['h1', 'h3', 'inconnu']);
    expect(found.map((h) => h.id).sort()).toEqual(['h1', 'h3']);
  });

  it('delete supprime le foyer et ses adhésions (comme le cascade), sans toucher aux autres', async () => {
    await households.createWithAdmin(
      household('h1', 'ABC234'),
      HouseholdMember.createAdmin('m1', 'u1', 'h1'),
    );
    await members.save(HouseholdMember.requestToJoin('m2', 'u2', 'h1'));
    await households.createWithAdmin(
      household('h2', 'ABC235'),
      HouseholdMember.createAdmin('m3', 'u1', 'h2'),
    );

    await households.delete('h1');

    expect(await households.findById('h1')).toBeNull();
    expect(await members.findByHousehold('h1')).toHaveLength(0);
    expect(await households.findById('h2')).not.toBeNull();
    expect(await members.findByUser('u1')).toHaveLength(1);
  });

  it('renvoie des copies : modifier sans save ne change pas le stock', async () => {
    await households.save(household('h1'));
    const h = await households.findById('h1');
    h!.rename('Autre nom');
    expect((await households.findById('h1'))?.name).toBe('Foyer');
  });
});

describe('HouseholdMemberInMemoryRepository', () => {
  let members: HouseholdMemberInMemoryRepository;

  beforeEach(() => {
    members = new HouseholdMemberInMemoryRepository();
  });

  it('refuse deux adhésions pour le même (userId, householdId)', async () => {
    await members.save(HouseholdMember.requestToJoin('m1', 'u1', 'h1'));

    await expect(
      members.save(HouseholdMember.createAdmin('m2', 'u1', 'h1')),
    ).rejects.toThrow();
    expect(await members.findByHousehold('h1')).toHaveLength(1);
  });

  it('accepte le même utilisateur dans deux foyers, et la mise à jour de sa propre ligne', async () => {
    const m1 = HouseholdMember.requestToJoin('m1', 'u1', 'h1');
    await members.save(m1);
    await members.save(HouseholdMember.createAdmin('m2', 'u1', 'h2'));

    m1.approve();
    await members.save(m1);

    expect(await members.findByUser('u1')).toHaveLength(2);
    expect((await members.findOne('h1', 'u1'))?.isActive()).toBe(true);
  });

  it('countActiveAdmins ignore les admins en attente et les autres foyers', async () => {
    await members.save(HouseholdMember.createAdmin('m1', 'u1', 'h1'));
    await members.save(
      new HouseholdMember({
        id: 'm2',
        userId: 'u2',
        householdId: 'h1',
        role: 'admin',
        status: 'pending',
      }),
    );
    await members.save(HouseholdMember.createAdmin('m3', 'u3', 'h2'));
    expect(await members.countActiveAdmins('h1')).toBe(1);
  });

  it('delete retire la ligne, ce qui permet de redemander', async () => {
    await members.save(HouseholdMember.requestToJoin('m1', 'u1', 'h1'));
    await members.delete('m1');
    expect(await members.findOne('h1', 'u1')).toBeNull();
    await members.save(HouseholdMember.requestToJoin('m2', 'u1', 'h1'));
    expect((await members.findOne('h1', 'u1'))?.id).toBe('m2');
  });

  it('renvoie des copies : modifier sans save ne change pas le stock', async () => {
    await members.save(HouseholdMember.requestToJoin('m1', 'u1', 'h1'));
    const m = await members.findOne('h1', 'u1');
    m!.approve();
    expect((await members.findOne('h1', 'u1'))?.isPending()).toBe(true);
  });
});
