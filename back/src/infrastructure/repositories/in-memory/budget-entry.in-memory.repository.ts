import { BudgetEntryEntity } from '../../../domain/entities/budget-entry.entity';
import { BudgetEntryRepositoryInterface } from '../../../application/repositories/budget-entry.repository.interface';

const clone = (entry: BudgetEntryEntity): BudgetEntryEntity =>
  new BudgetEntryEntity({
    id: entry.id,
    householdId: entry.householdId,
    createdById: entry.createdById,
    label: entry.label,
    amount: entry.amount,
    category: entry.category,
    date: new Date(entry.date),
    createdAt: new Date(entry.createdAt),
  });

export class BudgetEntryInMemoryRepository
  implements BudgetEntryRepositoryInterface
{
  private entries: BudgetEntryEntity[] = [];

  async save(entry: BudgetEntryEntity) {
    this.entries.push(clone(entry));
  }

  async findById(id: string) {
    const found = this.entries.find((e) => e.id === id);
    return found ? clone(found) : null;
  }

  async findByHousehold(householdId: string) {
    return this.entries
      .filter((e) => e.householdId === householdId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(clone);
  }

  async update(entry: BudgetEntryEntity) {
    const index = this.entries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      this.entries[index] = clone(entry);
    }
  }

  async delete(id: string) {
    this.entries = this.entries.filter((e) => e.id !== id);
  }
}