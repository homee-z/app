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
