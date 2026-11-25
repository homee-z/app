import { CreateHouseholdUsecase } from './create-household.usecase';
import { InvalidHouseholdNameException } from '../../../domain/entities/household.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('CreateHouseholdUsecase', () => {
  it("crée le foyer et l'utilisateur en devient admin actif", async () => {
    const t = householdsTestSetup();
    const view = await new CreateHouseholdUsecase(
      t.households,
      t.members,
    ).execute('u1', {
      name: '  Foyer Martin ',
    });

    expect(view).toMatchObject({
      name: 'Foyer Martin',
      role: 'admin',
      status: 'active',
      memberCount: 1,
    });
    expect(HouseholdCode.isValid(view.code!)).toBe(true);
    expect(await t.households.findById(view.id)).not.toBeNull();
    expect((await t.members.findOne(view.id, 'u1'))?.isAdmin()).toBe(true);
  });

  it('le premier foyer actif devient le foyer par défaut, pas les suivants', async () => {
    const t = householdsTestSetup();
    await t.addHousehold('u9', 'h0', 'AAAAAA');
    await t.addMember('h0', 'u1', 'member', 'pending'); // une demande en attente ne compte pas
    const create = new CreateHouseholdUsecase(t.households, t.members);

    const first = await create.execute('u1', { name: 'Premier' });
    const second = await create.execute('u1', { name: 'Second' });

    expect(first.isDefault).toBe(true);
    expect(second.isDefault).toBe(false);
    expect((await t.members.findOne(first.id, 'u1'))?.isDefault).toBe(true);
    expect((await t.members.findOne(second.id, 'u1'))?.isDefault).toBe(false);
  });

  it("refuse un nom invalide et n'enregistre rien", async () => {
    const t = householdsTestSetup();
    await expect(
      new CreateHouseholdUsecase(t.households, t.members).execute('u1', {
        name: ' a ',
      }),
    ).rejects.toThrow(InvalidHouseholdNameException);
    expect(await t.members.findByUser('u1')).toHaveLength(0);
  });

  it('réessaie si le code tiré existe déjà', async () => {
    const t = householdsTestSetup();
    await t.addHousehold('u0', 'h0', 'AAAAAA');
    const spy = jest
      .spyOn(HouseholdCode, 'generate')
      .mockReturnValueOnce('AAAAAA')
      .mockReturnValueOnce('BBBBBB');

    const view = await new CreateHouseholdUsecase(
      t.households,
      t.members,
    ).execute('u1', {
      name: 'Foyer',
    });

    expect(view.code).toBe('BBBBBB');
    spy.mockRestore();
  });

  it('abandonne après 5 collisions', async () => {
    const t = householdsTestSetup();
    await t.addHousehold('u0', 'h0', 'AAAAAA');
    const spy = jest.spyOn(HouseholdCode, 'generate').mockReturnValue('AAAAAA');

    await expect(
      new CreateHouseholdUsecase(t.households, t.members).execute('u1', {
        name: 'Foyer',
      }),
    ).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(5);
    spy.mockRestore();
  });
});
