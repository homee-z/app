import { DeleteBudgetEntryUseCase } from './delete-budget-entry.usecase';
import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { BudgetEntryEntity } from '../../../domain/entities/budget-entry.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('DeleteBudgetEntryUseCase', () => {
  let budgetEntryRepository: BudgetEntryRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: DeleteBudgetEntryUseCase;

  beforeEach(() => {
    budgetEntryRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByHousehold: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    householdMemberRepository = {
      findOne: jest.fn(),
      findByUser: jest.fn(),
      findByHousehold: jest.fn(),
      countActiveAdmins: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteBudgetEntryUseCase(
      budgetEntryRepository,
      householdMemberRepository,
    );
  });

  it('deletes a budget entry when the user is an active member of the household', async () => {
    const membership = HouseholdMember.createAdmin(
      'member-1',
      'user-1',
      'household-1',
    );
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      membership,
    );

    const entry = new BudgetEntryEntity({
      id: 'entry-1',
      householdId: 'household-1',
      createdById: 'user-2',
      label: 'Courses de la semaine',
      amount: 42.5,
      date: new Date('2026-01-01'),
    });
    (budgetEntryRepository.findById as jest.Mock).mockResolvedValue(entry);

    await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      entryId: 'entry-1',
    });

    expect(budgetEntryRepository.delete).toHaveBeenCalledTimes(1);
    expect(budgetEntryRepository.delete).toHaveBeenCalledWith('entry-1');
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        entryId: 'entry-1',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(budgetEntryRepository.delete).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when the budget entry belongs to another household', async () => {
    const membership = HouseholdMember.createAdmin(
      'member-1',
      'user-1',
      'household-1',
    );
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      membership,
    );

    const entry = new BudgetEntryEntity({
      id: 'entry-1',
      householdId: 'household-2',
      createdById: 'user-2',
      label: 'Courses de la semaine',
      amount: 42.5,
      date: new Date('2026-01-01'),
    });
    (budgetEntryRepository.findById as jest.Mock).mockResolvedValue(entry);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        entryId: 'entry-1',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(budgetEntryRepository.delete).not.toHaveBeenCalled();
  });
});