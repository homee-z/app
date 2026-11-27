import { KickMemberUsecase } from './kick-member.usecase';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('KickMemberUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    return { ...t, kick: new KickMemberUsecase(t.members) };
  };

  it('un admin exclut un membre', async () => {
    const t = await setup();
    await t.kick.execute('admin', 'h1', 'u2');
    expect(await t.members.findOne('h1', 'u2')).toBeNull();
  });

  it('un membre quitte le foyer, une demande en attente est annulée', async () => {
    const t = await setup();
    await t.kick.execute('u2', 'h1', 'u2');
    await t.kick.execute('u3', 'h1', 'u3');
    expect(await t.members.findByHousehold('h1')).toHaveLength(1);
  });

  it('quitter son foyer par défaut : le plus ancien foyer actif restant le remplace', async () => {
    const t = await setup();
    await t.members.setDefault('u2', 'h1');
    await t.addHousehold('x', 'h2', 'XYZ234');
    await t.addMember('h2', 'u2');
    await t.addHousehold('y', 'h3', 'QRS234');
    await t.addMember('h3', 'u2');
    await t.addHousehold('z', 'h4', 'TUV234');
    await t.addMember('h4', 'u2', 'member', 'pending'); // jamais par défaut

    await t.kick.execute('u2', 'h1', 'u2');

    const mine = await t.members.findByUser('u2');
    expect(mine.filter((m) => m.isDefault).map((m) => m.householdId)).toEqual([
      'h2',
    ]);
  });

  it('exclure un membre de son foyer par défaut le réattribue aussi ; sinon rien ne change', async () => {
    const t = await setup();
    await t.members.setDefault('u2', 'h1');
    await t.addHousehold('x', 'h2', 'XYZ234');
    await t.addMember('h2', 'u2');
    await t.addMember('h2', 'u3', 'member', 'active', true);

    await t.kick.execute('admin', 'h1', 'u2');
    await t.kick.execute('u3', 'h1', 'u3'); // annule sa demande : son défaut ne bouge pas

    expect((await t.members.findOne('h2', 'u2'))?.isDefault).toBe(true);
    expect((await t.members.findOne('h2', 'u3'))?.isDefault).toBe(true);
  });

  it('le dernier admin ne peut pas partir : 409', async () => {
    const t = await setup();
    await expect(t.kick.execute('admin', 'h1', 'admin')).rejects.toThrow(
      ConflictError,
    );
  });

  it("avec deux admins, un admin peut exclure ou laisser partir l'autre", async () => {
    const t = await setup();
    await t.addMember('h1', 'admin2', 'admin');
    await t.kick.execute('admin', 'h1', 'admin2');
    await t.addMember('h1', 'admin3', 'admin');
    await t.kick.execute('admin', 'h1', 'admin');
    expect(await t.members.countActiveAdmins('h1')).toBe(1);
  });

  it('membre non admin : 403 ; quitter un foyer dont on ne fait pas partie : 404', async () => {
    const t = await setup();
    await expect(t.kick.execute('u2', 'h1', 'admin')).rejects.toThrow(
      ForbiddenError,
    );
    await expect(t.kick.execute('u9', 'h1', 'u9')).rejects.toThrow(
      NotFoundError,
    );
  });
});
