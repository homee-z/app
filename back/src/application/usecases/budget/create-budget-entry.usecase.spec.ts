import { CreateBudgetEntryUseCase } from './create-budget-entry.usecase';
import { BudgetEntryRepositoryInterface } from '../../repositories/budget-entry.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('CreateBudgetEntryUseCase', () => {
  let budgetEntryRepository: BudgetEntryRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: CreateBudgetEntryUseCase;

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

    useCase = new CreateBudgetEntryUseCase(
      budgetEntryRepository,
      householdMemberRepository,
    );
  });

  it('creates a budget entry when the user is an active member of the household', async () => {
    const membership = HouseholdMember.createAdmin(
      'member-1',
      'user-1',
      'household-1',
    );
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      membership,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      label: 'Courses de la semaine',
      amount: 42.5,
      category: 'alimentation',
      date: new Date('2026-01-01'),
    });

    expect(result.householdId).toBe('household-1');
    expect(result.createdById).toBe('user-1');
    expect(result.label).toBe('Courses de la semaine');
    expect(result.amount).toBe(42.5);
    expect(result.category).toBe('alimentation');
    expect(budgetEntryRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        label: 'Courses de la semaine',
        amount: 42.5,
        date: new Date('2026-01-01'),
      }),
    ).rejects.toThrow(NotFoundError);
    expect(budgetEntryRepository.save).not.toHaveBeenCalled();
  });
});