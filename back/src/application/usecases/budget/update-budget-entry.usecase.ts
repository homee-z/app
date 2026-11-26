import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface UpdateBudgetEntryCommand {
  userId: string;
  householdId: string;
  entryId: string;
  label?: string;
  amount?: number;
  category?: string | null;
  date?: Date;
}

export interface UpdateBudgetEntryResult {
  id: string;
  householdId: string;
  createdById: string;
  label: string;
  amount: number;
  category: string | null;
  date: Date;
  createdAt: Date;
}

export class UpdateBudgetEntryUseCase {
  constructor(
    private readonly budgetEntryRepository: BudgetEntryRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: UpdateBudgetEntryCommand,
  ): Promise<UpdateBudgetEntryResult> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const entry = await this.budgetEntryRepository.findById(command.entryId);
    if (!entry || entry.householdId !== command.householdId) {
      throw new NotFoundError('Budget entry not found');
    }

    entry.update({
      label: command.label,
      amount: command.amount,
      category: command.category,
      date: command.date,
    });

    await this.budgetEntryRepository.update(entry);

    return {
      id: entry.id,
      householdId: entry.householdId,
      createdById: entry.createdById,
      label: entry.label,
      amount: entry.amount,
      category: entry.category,
      date: entry.date,
      createdAt: entry.createdAt,
    };
  }
}