import { AddShoppingItemUseCase } from './add-shopping-item.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('AddShoppingItemUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: AddShoppingItemUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

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

    useCase = new AddShoppingItemUseCase(
      shoppingItemRepository,
      shoppingListRepository,
      householdMemberRepository,
    );
  });

  it('creates a new shopping item when the user is an active member and the list belongs to the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      new ShoppingListEntity({
        id: 'list-1',
        householdId: 'household-1',
        name: 'Courses',
      }),
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      shoppingListId: 'list-1',
      name: 'Lait',
    });

    expect(result.name).toBe('Lait');
    expect(result.shoppingListId).toBe('list-1');
    expect(shoppingItemRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        shoppingListId: 'list-1',
        name: 'Lait',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(shoppingItemRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when the shopping list belongs to another household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      new ShoppingListEntity({
        id: 'list-1',
        householdId: 'household-2',
        name: 'Courses',
      }),
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        shoppingListId: 'list-1',
        name: 'Lait',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(shoppingItemRepository.save).not.toHaveBeenCalled();
  });
});