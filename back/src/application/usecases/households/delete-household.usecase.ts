import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveAdmin, requireHousehold } from './household-access';

// Supprime le foyer, même s'il reste d'autres membres : leurs adhésions partent en cascade.
export class DeleteHouseholdUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: HouseholdMemberRepositoryInterface,
  ) {}

  async execute(adminId: string, householdId: string): Promise<void> {
    await requireActiveAdmin(this.members, householdId, adminId);
    await requireHousehold(this.households, householdId);
    await this.households.delete(householdId);
  }
}
