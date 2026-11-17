import { RenameHouseholdUsecase } from './rename-household.usecase';
import { InvalidHouseholdNameException } from '../../../domain/entities/household.entity';
import { DomainError } from '../../../domain/errors/domain.error';
import { ForbiddenError } from '../../../domain/errors/forbidden.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { householdsTestSetup } from '../../../../test/households.fixtures';

describe('RenameHouseholdUsecase', () => {
  const setup = async () => {
    const t = householdsTestSetup();
    await t.addHousehold('admin', 'h1', 'ABC234');
    await t.addMember('h1', 'u2');
    await t.addMember('h1', 'u3', 'member', 'pending');
    return {
      ...t,
      rename: new RenameHouseholdUsecase(t.households, t.members),
    };
  };

  it('un admin renomme le foyer (trim) et reçoit la vue avec le code', async () => {
    const t = await setup();
    const view = await t.rename.execute('admin', 'h1', {
      name: '  Famille Martin ',
    });

    expect(view).toMatchObject({
      id: 'h1',
      name: 'Famille Martin',
      role: 'admin',
      memberCount: 2,
      code: 'ABC234',
    });
    expect((await t.households.findById('h1'))?.name).toBe('Famille Martin');
  });

  it('nom invalide (après trim) : 400, le nom ne change pas', async () => {
    const t = await setup();
    await expect(
      t.rename.execute('admin', 'h1', { name: ' a ' }),
    ).rejects.toThrow(InvalidHouseholdNameException);
    await expect(
      t.rename.execute('admin', 'h1', { name: 'a'.repeat(51) }),
    ).rejects.toThrow(DomainError);
    expect((await t.households.findById('h1'))?.name).toBe('Foyer test');
  });

  it('membre non admin : 403', async () => {
    const t = await setup();
    await expect(
      t.rename.execute('u2', 'h1', { name: 'Autre' }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('demande en attente, non-membre ou foyer inconnu : 404', async () => {
    const t = await setup();
    await expect(
      t.rename.execute('u3', 'h1', { name: 'Autre' }),
    ).rejects.toThrow(NotFoundError);
    await expect(
      t.rename.execute('inconnu', 'h1', { name: 'Autre' }),
    ).rejects.toThrow(NotFoundError);
    await expect(
      t.rename.execute('admin', 'h9', { name: 'Autre' }),
    ).rejects.toThrow(NotFoundError);
    expect((await t.households.findById('h1'))?.name).toBe('Foyer test');
  });
});
