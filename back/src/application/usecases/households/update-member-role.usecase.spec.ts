import { UpdateMemberRoleUsecase } from './update-member-role.usecase';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { DomainError } from '../../../domain/errors/domain.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('UpdateMemberRoleUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addUser('u2', 'Bob');
    await t.addHousehold('admin', 'h1');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    return { ...t, update: new UpdateMemberRoleUsecase(t.members, t.users) };
  };

  it('un admin change le rôle et reçoit la vue du membre', async () => {
    const t = await setup();
    const view = await t.update.execute('admin', 'h1', 'u2', 'guest');
    expect(view).toMatchObject({
      userId: 'u2',
      firstName: 'Bob',
      role: 'guest',
    });
    expect((await t.members.findOne('h1', 'u2'))?.role).toBe('guest');
  });

  it('le dernier admin ne peut pas se rétrograder : 409', async () => {
    const t = await setup();
    await expect(
      t.update.execute('admin', 'h1', 'admin', 'member'),
    ).rejects.toThrow(ConflictError);
    expect((await t.members.findOne('h1', 'admin'))?.isAdmin()).toBe(true);
  });

  it("avec deux admins, l'un peut se rétrograder", async () => {
    const t = await setup();
    await t.update.execute('admin', 'h1', 'u2', 'admin');
    await t.update.execute('admin', 'h1', 'admin', 'member');
    expect(await t.members.countActiveAdmins('h1')).toBe(1);
  });

  it('demande en attente : 400 ; membre non admin : 403', async () => {
    const t = await setup();
    await expect(
      t.update.execute('admin', 'h1', 'u3', 'guest'),
    ).rejects.toThrow(DomainError);
    await expect(t.update.execute('u2', 'h1', 'u2', 'admin')).rejects.toThrow(
      ForbiddenError,
    );
  });
});
