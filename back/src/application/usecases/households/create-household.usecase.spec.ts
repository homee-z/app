import { CreateHouseholdUsecase } from './create-household.usecase';
import { InvalidHouseholdNameException } from '../../../domain/entities/household.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('CreateHouseholdUsecase', () => {
  it("crée le foyer et l'utilisateur en devient admin actif", async () => {
    const t = householdsTestSetup();
    const view = await new CreateHouseholdUsecase(t.households).execute('u1', {
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

  it("refuse un nom invalide et n'enregistre rien", async () => {
    const t = householdsTestSetup();
    await expect(
      new CreateHouseholdUsecase(t.households).execute('u1', { name: ' a ' }),
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

    const view = await new CreateHouseholdUsecase(t.households).execute('u1', {
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
      new CreateHouseholdUsecase(t.households).execute('u1', { name: 'Foyer' }),
    ).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(5);
    spy.mockRestore();
  });
});
