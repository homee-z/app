import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { DefaultHouseholdRepositoryInterface } from '../../repositories/household-member.repository.interface';
import {
  ensureDefaultHousehold,
  requireActiveAdmin,
  requireHousehold,
} from './household-access';

// Supprime le foyer, même s'il reste d'autres membres : leurs adhésions partent en cascade.
// Les membres dont c'était le foyer par défaut récupèrent leur plus ancien foyer actif.
export class DeleteHouseholdUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: DefaultHouseholdRepositoryInterface,
  ) {}

  async execute(adminId: string, householdId: string): Promise<void> {
    await requireActiveAdmin(this.members, householdId, adminId);
    await requireHousehold(this.households, householdId);
    const affected = (await this.members.findByHousehold(householdId))
      .filter((m) => m.isDefault)
      .map((m) => m.userId);
    await this.households.delete(householdId);
    for (const userId of affected) {
      await ensureDefaultHousehold(this.members, userId);
    }
  }
}
