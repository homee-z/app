import { UserRepositoryInterface } from '../../repositories/user.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from './household-access';
import { HouseholdMemberView, toHouseholdMemberView } from './household-views';

// Membres d'un foyer. Les demandes en attente ne sont visibles que par les admins.
export class ListMembersUsecase {
  constructor(
    private readonly members: HouseholdMemberRepositoryInterface,
    private readonly users: UserRepositoryInterface,
  ) {}

  async execute(
    userId: string,
    householdId: string,
  ): Promise<HouseholdMemberView[]> {
    const requester = await requireActiveMember(
      this.members,
      householdId,
      userId,
    );

    const all = await this.members.findByHousehold(householdId);
    const visible = requester.isAdmin() ? all : all.filter((m) => m.isActive());

    return Promise.all(
      visible.map(async (m) =>
        toHouseholdMemberView(m, await this.users.findById(m.userId)),
      ),
    );
  }
}
