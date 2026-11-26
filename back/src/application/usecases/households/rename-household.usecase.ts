import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveAdmin, requireHousehold } from './household-access';
import { HouseholdView, toHouseholdView } from './household-views';

export interface RenameHouseholdInput {
  name: string;
}

export class RenameHouseholdUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: HouseholdMemberRepositoryInterface,
  ) {}

  async execute(
    adminId: string,
    householdId: string,
    input: RenameHouseholdInput,
  ): Promise<HouseholdView> {
    const admin = await requireActiveAdmin(this.members, householdId, adminId);
    const household = await requireHousehold(this.households, householdId);

    household.rename(input.name); // InvalidHouseholdNameException (400) : même règle qu'à la création
    await this.households.save(household);

    const activeCount = (
      await this.members.findByHousehold(householdId)
    ).filter((m) => m.isActive()).length;
    return toHouseholdView(household, admin, activeCount);
  }
}
