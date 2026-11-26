import { CreateShoppingListUseCase } from './create-shopping-list.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('CreateShoppingListUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: CreateShoppingListUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
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

    useCase = new CreateShoppingListUseCase(
      shoppingListRepository,
      householdMemberRepository,
    );
  });

  it('creates a shopping list when the user is an active member of the household', async () => {
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
      name: 'Courses',
    });

    expect(result.householdId).toBe('household-1');
    expect(result.name).toBe('Courses');
    expect(shoppingListRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        name: 'Courses',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(shoppingListRepository.save).not.toHaveBeenCalled();
  });
});