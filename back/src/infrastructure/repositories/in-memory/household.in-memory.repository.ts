import { Household } from '../../../domain/entities/household.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { HouseholdRepositoryInterface } from '../../../application/repositories/household.repository.interface';
import { HouseholdMemberInMemoryRepository } from './household-member.in-memory.repository';

const clone = (h: Household): Household =>
  new Household({
    id: h.id,
    name: h.name,
    code: new HouseholdCode(h.code.value),
    createdAt: new Date(h.createdAt),
  });

export class HouseholdInMemoryRepository implements HouseholdRepositoryInterface {
  private households: Household[] = [];

  // createWithAdmin écrit aussi l'admin : on partage le repo des membres.
  constructor(private readonly members: HouseholdMemberInMemoryRepository) {}

  async findById(id: string) {
    const found = this.households.find((h) => h.id === id);
    return found ? clone(found) : null;
  }

  async findByCode(code: HouseholdCode | string) {
    const value =
      typeof code === 'string' ? new HouseholdCode(code).value : code.value;
    const found = this.households.find((h) => h.code.value === value);
    return found ? clone(found) : null;
  }

  async findByIds(ids: string[]) {
    return this.households.filter((h) => ids.includes(h.id)).map(clone);
  }

  async save(household: Household) {
    const copy = clone(household);
    // Même contrainte que l'index unique sur code en base.
    if (
      this.households.some(
        (h) => h.id !== copy.id && h.code.value === copy.code.value,
      )
    ) {
      throw new Error('Duplicate household code');
    }
    const index = this.households.findIndex((h) => h.id === copy.id);
    if (index >= 0) this.households[index] = copy;
    else this.households.push(copy);
  }

  // Atomique comme la transaction Postgres : si l'écriture de l'admin échoue,
  // le foyer est retiré et rien n'est enregistré.
  async createWithAdmin(household: Household, admin: HouseholdMember) {
    const snapshot = [...this.households];
    await this.save(household);
    try {
      await this.members.save(admin);
    } catch (error) {
      this.households = snapshot;
      throw error;
    }
  }

  // Comme le ON DELETE CASCADE en Postgres : les adhésions du foyer sont supprimées aussi.
  async delete(id: string) {
    this.households = this.households.filter((h) => h.id !== id);
    await this.members.deleteByHousehold(id);
  }
}
