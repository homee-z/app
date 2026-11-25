import { randomUUID } from 'crypto';
import { BudgetEntryEntity } from '../../../domain/entities/budget-entry.entity';
import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';

export interface CreateBudgetEntryCommand {
  userId: string;
  householdId: string;
  label: string;
  amount: number;
  category?: string | null;
  date: Date;
}

export interface CreateBudgetEntryResult {
  id: string;
  householdId: string;
  createdById: string;
  label: string;
  amount: number;
  category: string | null;
  date: Date;
  createdAt: Date;
}

export class CreateBudgetEntryUseCase {
  constructor(
    private readonly budgetEntryRepository: BudgetEntryRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: CreateBudgetEntryCommand,
  ): Promise<CreateBudgetEntryResult> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const entry = new BudgetEntryEntity({
      id: randomUUID(),
      householdId: command.householdId,
      createdById: command.userId,
      label: command.label,
      amount: command.amount,
      category: command.category,
      date: command.date,
    });

    await this.budgetEntryRepository.save(entry);

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