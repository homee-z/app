import { ListBudgetEntriesUseCase } from './list-budget-entries.usecase';
import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { BudgetEntryEntity } from '../../../domain/entities/budget-entry.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('ListBudgetEntriesUseCase', () => {
  let budgetEntryRepository: BudgetEntryRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: ListBudgetEntriesUseCase;

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

    useCase = new ListBudgetEntriesUseCase(
      budgetEntryRepository,
      householdMemberRepository,
    );
  });

  it('returns the budget entries of the household when the user is an active member', async () => {
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
      createdById: 'user-1',
      label: 'Courses de la semaine',
      amount: 42.5,
      date: new Date('2026-01-01'),
    });
    (budgetEntryRepository.findByHousehold as jest.Mock).mockResolvedValue([
      entry,
    ]);

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Courses de la semaine');
    expect(budgetEntryRepository.findByHousehold).toHaveBeenCalledWith(
      'household-1',
    );
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(budgetEntryRepository.findByHousehold).not.toHaveBeenCalled();
  });
});