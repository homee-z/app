import { ListShoppingItemsUseCase } from './list-shopping-items.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('ListShoppingItemsUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: ListShoppingItemsUseCase;

  const activeList = new ShoppingListEntity({
    id: 'list-1',
    householdId: 'household-1',
    name: 'Courses',
  });

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    shoppingListRepository = {
      findById: jest.fn().mockResolvedValue(activeList),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    householdMemberRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue(
          HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
        ),
      findByUser: jest.fn(),
      findByHousehold: jest.fn(),
      countActiveAdmins: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListShoppingItemsUseCase(
      shoppingItemRepository,
      shoppingListRepository,
      householdMemberRepository,
    );
  });

  it('returns all items for a shopping list', async () => {
    const items = [
      new ShoppingItemEntity({
        id: 'item-1',
        shoppingListId: 'list-1',
        name: 'Lait',
      }),
    ];
    (shoppingItemRepository.findAllByList as jest.Mock).mockResolvedValue(
      items,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      shoppingListId: 'list-1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Lait');
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        shoppingListId: 'list-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when the shopping list belongs to another household', async () => {
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
      }),
    ).rejects.toThrow(NotFoundError);
  });
});