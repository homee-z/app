import { DefaultHouseholdRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import {
  assertNotLastAdmin,
  ensureDefaultHousehold,
  requireActiveAdmin,
  requireTargetMember,
} from './household-access';

// - sur soi-même : quitter le foyer (ou annuler sa demande si elle est en attente) ;
// - sur un autre membre : l'exclure, réservé à un admin actif.
// Dans les deux cas, le dernier admin ne peut pas être retiré (409).
// Si c'était le foyer par défaut de la personne retirée, son plus ancien foyer actif le remplace.
export class KickMemberUsecase {
  constructor(private readonly members: DefaultHouseholdRepositoryInterface) {}

  async execute(
    requesterId: string,
    householdId: string,
    targetUserId: string,
  ): Promise<void> {
    if (requesterId === targetUserId) {
      const own = await this.members.findOne(householdId, requesterId);
      if (!own) throw new NotFoundError('Household not found');
      await assertNotLastAdmin(this.members, own);
      await this.members.delete(own.id);
      await ensureDefaultHousehold(this.members, requesterId);
      return;
    }

    await requireActiveAdmin(this.members, householdId, requesterId);
    const target = await requireTargetMember(
      this.members,
      householdId,
      targetUserId,
    );
    await assertNotLastAdmin(this.members, target);
    await this.members.delete(target.id);
    await ensureDefaultHousehold(this.members, targetUserId);
  }
}
