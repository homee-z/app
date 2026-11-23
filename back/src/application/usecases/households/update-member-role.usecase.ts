import { HouseholdRole } from '../../../domain/entities/household-member.entity';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import {
  assertNotLastAdmin,
  requireActiveAdmin,
  requireTargetMember,
} from './household-access';
import { HouseholdMemberView, toHouseholdMemberView } from './household-views';
import { UserRepositoryInterface } from '../../repositories/user.repository.interface';

export class UpdateMemberRoleUsecase {
  constructor(
    private readonly members: HouseholdMemberRepositoryInterface,
    private readonly users: UserRepositoryInterface,
  ) {}

  async execute(
    adminId: string,
    householdId: string,
    targetUserId: string,
    role: HouseholdRole,
  ): Promise<HouseholdMemberView> {
    await requireActiveAdmin(this.members, householdId, adminId);
    const target = await requireTargetMember(
      this.members,
      householdId,
      targetUserId,
    );

    // Rétrograder le dernier admin (y compris soi-même) est interdit : 409.
    if (role !== 'admin') await assertNotLastAdmin(this.members, target);

    target.changeRole(role); // DomainError (400) si la demande est en attente
    await this.members.save(target);
    return toHouseholdMemberView(
      target,
      await this.users.findById(target.userId),
    );
  }
}
