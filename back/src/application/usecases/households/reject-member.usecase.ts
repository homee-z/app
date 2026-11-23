import { DomainError } from '../../../domain/errors/domain.error';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveAdmin, requireTargetMember } from './household-access';

// Refuser une demande supprime la ligne : l'utilisateur pourra redemander.
export class RejectMemberUsecase {
  constructor(private readonly members: HouseholdMemberRepositoryInterface) {}

  async execute(
    adminId: string,
    householdId: string,
    targetUserId: string,
  ): Promise<void> {
    await requireActiveAdmin(this.members, householdId, adminId);
    const target = await requireTargetMember(
      this.members,
      householdId,
      targetUserId,
    );
    if (!target.isPending()) {
      throw new DomainError('Only a pending request can be rejected');
    }

    await this.members.delete(target.id);
  }
}
