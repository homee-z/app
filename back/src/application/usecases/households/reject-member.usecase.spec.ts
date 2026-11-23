import { RejectMemberUsecase } from './reject-member.usecase';
import { DomainError } from '../../../domain/errors/domain.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('RejectMemberUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    return { ...t, reject: new RejectMemberUsecase(t.members) };
  };

  it("un refus supprime la ligne : l'utilisateur peut redemander", async () => {
    const t = await setup();
    await t.reject.execute('admin', 'h1', 'u3');
    expect(await t.members.findOne('h1', 'u3')).toBeNull();
    await t.addMember('h1', 'u3', 'member', 'pending');
    expect(await t.members.findOne('h1', 'u3')).not.toBeNull();
  });

  it('refuser un membre déjà actif : 400', async () => {
    const t = await setup();
    await expect(t.reject.execute('admin', 'h1', 'u2')).rejects.toThrow(
      DomainError,
    );
    expect(await t.members.findOne('h1', 'u2')).not.toBeNull();
  });

  it('membre non admin : 403', async () => {
    const t = await setup();
    await expect(t.reject.execute('u2', 'h1', 'u3')).rejects.toThrow(
      ForbiddenError,
    );
  });
});
