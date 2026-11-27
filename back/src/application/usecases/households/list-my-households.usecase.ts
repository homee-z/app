import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { pickDefaultMembership } from './household-access';
import { HouseholdView, toHouseholdView } from './household-views';

// Foyers de l'utilisateur, y compris ses demandes en attente (status 'pending').
// Adhésions créées avant la colonne is_default : si aucun foyer actif n'est marqué,
// le plus ancien est renvoyé comme foyer par défaut (même règle que ensureDefaultHousehold).
export class ListMyHouseholdsUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: HouseholdMemberRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<HouseholdView[]> {
    const memberships = await this.members.findByUser(userId);
    const households = await this.households.findByIds(
      memberships.map((m) => m.householdId),
    );

    const fallback = pickDefaultMembership(memberships);
    if (fallback) fallback.isDefault = true; // vue seulement, rien n'est enregistré

    const views: HouseholdView[] = [];
    for (const membership of memberships) {
      const household = households.find((h) => h.id === membership.householdId);
      if (!household) continue;
      const activeCount = (
        await this.members.findByHousehold(household.id)
      ).filter((m) => m.isActive()).length;
      views.push(toHouseholdView(household, membership, activeCount));
    }
    return views;
  }
}
