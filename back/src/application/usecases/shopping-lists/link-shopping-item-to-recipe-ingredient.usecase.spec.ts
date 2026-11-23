import { LinkShoppingItemToRecipeIngredientUseCase } from './link-shopping-item-to-recipe-ingredient.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('LinkShoppingItemToRecipeIngredientUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: LinkShoppingItemToRecipeIngredientUseCase;

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

    useCase = new LinkShoppingItemToRecipeIngredientUseCase(
      shoppingItemRepository,
      shoppingListRepository,
      householdMemberRepository,
    );
  });

  it('links an existing shopping item to a recipe ingredient', async () => {
    const existingItem = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-1',
      name: 'Farine',
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      existingItem,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      shoppingListId: 'list-1',
      id: 'item-1',
      recipeIngredientId: 'ingredient-1',
    });

    expect(result.recipeIngredientId).toBe('ingredient-1');
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        shoppingListId: 'list-1',
        id: 'item-1',
        recipeIngredientId: 'ingredient-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when the item does not belong to the given shopping list', async () => {
    const itemFromAnotherList = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-2',
      name: 'Farine',
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      itemFromAnotherList,
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        shoppingListId: 'list-1',
        id: 'item-1',
        recipeIngredientId: 'ingredient-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });
});