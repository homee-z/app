import { DefaultHouseholdRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from './household-access';

// Choisit le foyer ouvert à la connexion. Réservé à une adhésion active :
// une demande en attente ou un non-membre reçoit 404, comme ailleurs.
export class SetDefaultHouseholdUsecase {
  constructor(private readonly members: DefaultHouseholdRepositoryInterface) {}

  async execute(userId: string, householdId: string): Promise<void> {
    const membership = await requireActiveMember(
      this.members,
      householdId,
      userId,
    );
    if (membership.isDefault) return;
    await this.members.setDefault(userId, householdId);
  }
}
