import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { HouseholdMemberRepositoryInterface } from '../../../application/repositories/household-member.repository.interface';

// Copie défensive : comme avec Postgres, modifier une adhésion sans save ne change pas le stock.
const clone = (m: HouseholdMember): HouseholdMember =>
  new HouseholdMember({
    id: m.id,
    userId: m.userId,
    householdId: m.householdId,
    role: m.role,
    status: m.status,
    createdAt: new Date(m.createdAt),
  });

export class HouseholdMemberInMemoryRepository implements HouseholdMemberRepositoryInterface {
  private members: HouseholdMember[] = [];

  async findOne(householdId: string, userId: string) {
    const found = this.members.find(
      (m) => m.householdId === householdId && m.userId === userId,
    );
    return found ? clone(found) : null;
  }

  async findByUser(userId: string) {
    return this.members.filter((m) => m.userId === userId).map(clone);
  }

  async findByHousehold(householdId: string) {
    return this.members.filter((m) => m.householdId === householdId).map(clone);
  }

  async countActiveAdmins(householdId: string) {
    return this.members.filter(
      (m) => m.householdId === householdId && m.isAdmin(),
    ).length;
  }

  async save(member: HouseholdMember) {
    const copy = clone(member);
    const index = this.members.findIndex((m) => m.id === copy.id);
    if (index >= 0) {
      this.members[index] = copy;
      return;
    }
    // Même contrainte que l'index unique (user_id, household_id) en base.
    if (
      this.members.some(
        (m) => m.userId === copy.userId && m.householdId === copy.householdId,
      )
    ) {
      throw new Error('Duplicate household member (userId, householdId)');
    }
    this.members.push(copy);
  }

  async delete(id: string) {
    this.members = this.members.filter((m) => m.id !== id);
  }
}
