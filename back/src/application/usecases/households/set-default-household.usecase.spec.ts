import { SetDefaultHouseholdUsecase } from './set-default-household.usecase';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('SetDefaultHouseholdUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('u1', 'h1', 'AAAAAA');
    await t.members.setDefault('u1', 'h1');
    await t.addHousehold('u9', 'h2', 'BBBBBB');
    await t.addMember('h2', 'u1');
    await t.addHousehold('u9', 'h3', 'CCCCCC');
    await t.addMember('h3', 'u1', 'member', 'pending');
    return { ...t, setDefault: new SetDefaultHouseholdUsecase(t.members) };
  };

  const defaults = async (t: Awaited<ReturnType<typeof setup>>) =>
    (await t.members.findByUser('u1'))
      .filter((m) => m.isDefault)
      .map((m) => m.householdId);

  it("change le foyer par défaut : l'ancien perd le flag", async () => {
    const t = await setup();
    await t.setDefault.execute('u1', 'h2');
    expect(await defaults(t)).toEqual(['h2']);
  });

  it('idempotent : redéfinir le même foyer ne change rien', async () => {
    const t = await setup();
    await t.setDefault.execute('u1', 'h1');
    await t.setDefault.execute('u1', 'h1');
    expect(await defaults(t)).toEqual(['h1']);
  });

  it('ne touche pas au foyer par défaut des autres membres', async () => {
    const t = await setup();
    await t.members.setDefault('u9', 'h2');
    await t.setDefault.execute('u1', 'h2');
    expect((await t.members.findOne('h2', 'u9'))?.isDefault).toBe(true);
  });

  it('demande en attente, non-membre ou foyer inconnu : 404, rien ne change', async () => {
    const t = await setup();
    for (const id of ['h3', 'h9']) {
      await expect(t.setDefault.execute('u1', id)).rejects.toThrow(
        NotFoundError,
      );
    }
    await expect(t.setDefault.execute('u2', 'h1')).rejects.toThrow(
      NotFoundError,
    );
    expect(await defaults(t)).toEqual(['h1']);
  });
});
