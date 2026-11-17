import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import {
  generateUniqueCode,
  requireActiveAdmin,
  requireHousehold,
} from './household-access';

// L'ancien code ne fonctionne plus : utile s'il a été partagé par erreur.
export class RegenerateCodeUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: HouseholdMemberRepositoryInterface,
  ) {}

  async execute(
    adminId: string,
    householdId: string,
  ): Promise<{ code: string }> {
    await requireActiveAdmin(this.members, householdId, adminId);
    const household = await requireHousehold(this.households, householdId);

    household.code = await generateUniqueCode(this.households);
    await this.households.save(household);
    return { code: household.code.value };
  }
}
