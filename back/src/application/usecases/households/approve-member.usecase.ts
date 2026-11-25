import { DefaultHouseholdRepositoryInterface } from '../../repositories/household-member.repository.interface';
import {
  ensureDefaultHousehold,
  requireActiveAdmin,
  requireTargetMember,
} from './household-access';

export class ApproveMemberUsecase {
  constructor(private readonly members: DefaultHouseholdRepositoryInterface) {}

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
    // Premier foyer actif du membre : il devient son foyer par défaut.
    await ensureDefaultHousehold(this.members, target.userId);
  }
}
