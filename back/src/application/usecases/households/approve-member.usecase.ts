import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveAdmin, requireTargetMember } from './household-access';

export class ApproveMemberUsecase {
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

    target.approve(); // DomainError (400) si déjà actif
    await this.members.save(target);
  }
}
