import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';

export interface ListBudgetEntriesCommand {
  userId: string;
  householdId: string;
}

export interface BudgetEntrySummary {
  id: string;
  householdId: string;
  createdById: string;
  label: string;
  amount: number;
  category: string | null;
  date: Date;
  createdAt: Date;
}

export class ListBudgetEntriesUseCase {
  constructor(
    private readonly budgetEntryRepository: BudgetEntryRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: ListBudgetEntriesCommand,
  ): Promise<BudgetEntrySummary[]> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const entries = await this.budgetEntryRepository.findByHousehold(
      command.householdId,
    );

    return entries.map((entry) => ({
      id: entry.id,
      householdId: entry.householdId,
      createdById: entry.createdById,
      label: entry.label,
      amount: entry.amount,
      category: entry.category,
      date: entry.date,
      createdAt: entry.createdAt,
    }));
  }
}