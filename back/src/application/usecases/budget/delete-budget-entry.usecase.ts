import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface DeleteBudgetEntryCommand {
  userId: string;
  householdId: string;
  entryId: string;
}

export class DeleteBudgetEntryUseCase {
  constructor(
    private readonly budgetEntryRepository: BudgetEntryRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(command: DeleteBudgetEntryCommand): Promise<void> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const entry = await this.budgetEntryRepository.findById(command.entryId);
    if (!entry || entry.householdId !== command.householdId) {
      throw new NotFoundError('Budget entry not found');
    }

    await this.budgetEntryRepository.delete(entry.id);
  }
}