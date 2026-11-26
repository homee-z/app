import { DeleteHouseholdUsecase } from './delete-household.usecase';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('DeleteHouseholdUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1', 'ABC234');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    await t.addHousehold('autre', 'h2', 'XYZ234');
    return {
      ...t,
      remove: new DeleteHouseholdUsecase(t.households, t.members),
    };
  };

  it("un admin supprime le foyer même avec d'autres membres : toutes les adhésions partent", async () => {
    const t = await setup();
    await t.remove.execute('admin', 'h1');

    expect(await t.households.findById('h1')).toBeNull();
    expect(await t.households.findByCode('ABC234')).toBeNull();
    expect(await t.members.findByHousehold('h1')).toHaveLength(0);
    // Les autres foyers ne sont pas touchés
    expect(await t.households.findById('h2')).not.toBeNull();
    expect(await t.members.findByHousehold('h2')).toHaveLength(1);
  });

  it('un admin seul dans son foyer peut le supprimer (et donc en sortir)', async () => {
    const t = await setup();
    await t.remove.execute('autre', 'h2');
    expect(await t.members.findByUser('autre')).toHaveLength(0);
  });

  it("membre non admin : 403, rien n'est supprimé", async () => {
    const t = await setup();
    await expect(t.remove.execute('u2', 'h1')).rejects.toThrow(ForbiddenError);
    expect(await t.households.findById('h1')).not.toBeNull();
    expect(await t.members.findByHousehold('h1')).toHaveLength(3);
  });

  it('demande en attente, non-membre ou foyer inconnu : 404', async () => {
    const t = await setup();
    await expect(t.remove.execute('u3', 'h1')).rejects.toThrow(NotFoundError);
    await expect(t.remove.execute('admin', 'h2')).rejects.toThrow(
      NotFoundError,
    );
    await expect(t.remove.execute('admin', 'h9')).rejects.toThrow(
      NotFoundError,
    );
    expect(await t.households.findById('h1')).not.toBeNull();
  });
});
