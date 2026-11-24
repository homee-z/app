import { BudgetEntryEntity } from '../../domain/entities/budget-entry.entity';

export const BUDGET_ENTRY_REPOSITORY = Symbol('BUDGET_ENTRY_REPOSITORY');

export interface BudgetEntryRepositoryInterface {
  save(entry: BudgetEntryEntity): Promise<void>;
  findById(id: string): Promise<BudgetEntryEntity | null>;
  findByHousehold(householdId: string): Promise<BudgetEntryEntity[]>;
  update(entry: BudgetEntryEntity): Promise<void>;
  delete(id: string): Promise<void>;
}