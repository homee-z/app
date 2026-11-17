import { JoinHouseholdUsecase } from './join-household.usecase';
import { InvalidHouseholdCodeException } from '../../../domain/value-objects/household-code.value-object';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('JoinHouseholdUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1', 'ABC234');
    return { ...t, join: new JoinHouseholdUsecase(t.households, t.members) };
  };

  it('crée une demande en attente, sans révéler le code', async () => {
    const t = await setup();
    const view = await t.join.execute('u1', { code: ' abc234 ' });

    expect(view).toMatchObject({
      id: 'h1',
      role: 'member',
      status: 'pending',
      memberCount: 1,
    });
    expect(view.code).toBeUndefined();
    expect((await t.members.findOne('h1', 'u1'))?.isPending()).toBe(true);
  });

  it('code mal formé : erreur métier (400)', async () => {
    const t = await setup();
    await expect(t.join.execute('u1', { code: 'ABC0EF' })).rejects.toThrow(
      InvalidHouseholdCodeException,
    );
  });

  it('code inconnu : 404', async () => {
    const t = await setup();
    await expect(t.join.execute('u1', { code: 'ZZZZZZ' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('demande déjà en attente ou déjà membre : 409', async () => {
    const t = await setup();
    await t.join.execute('u1', { code: 'ABC234' });
    await expect(t.join.execute('u1', { code: 'ABC234' })).rejects.toThrow(
      ConflictError,
    );
    await expect(t.join.execute('admin', { code: 'ABC234' })).rejects.toThrow(
      ConflictError,
    );
  });
});
