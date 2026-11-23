import { ApproveMemberUsecase } from './approve-member.usecase';
import { DomainError } from '../../../domain/errors/domain.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('ApproveMemberUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    return { ...t, approve: new ApproveMemberUsecase(t.members) };
  };

  it('un admin valide une demande', async () => {
    const t = await setup();
    await t.approve.execute('admin', 'h1', 'u3');
    expect((await t.members.findOne('h1', 'u3'))?.isActive()).toBe(true);
  });

  it('valider un membre déjà actif : 400', async () => {
    const t = await setup();
    await expect(t.approve.execute('admin', 'h1', 'u2')).rejects.toThrow(
      DomainError,
    );
  });

  it('membre non admin : 403, non-membre : 404', async () => {
    const t = await setup();
    await expect(t.approve.execute('u2', 'h1', 'u3')).rejects.toThrow(
      ForbiddenError,
    );
    await expect(t.approve.execute('inconnu', 'h1', 'u3')).rejects.toThrow(
      NotFoundError,
    );
    expect((await t.members.findOne('h1', 'u3'))?.isPending()).toBe(true);
  });

  it('cible inconnue : 404', async () => {
    const t = await setup();
    await expect(t.approve.execute('admin', 'h1', 'u9')).rejects.toThrow(
      NotFoundError,
    );
  });
});
