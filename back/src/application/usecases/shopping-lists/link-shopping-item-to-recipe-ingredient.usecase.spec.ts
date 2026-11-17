import { LinkShoppingItemToRecipeIngredientUseCase } from './link-shopping-item-to-recipe-ingredient.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('LinkShoppingItemToRecipeIngredientUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let useCase: LinkShoppingItemToRecipeIngredientUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new LinkShoppingItemToRecipeIngredientUseCase(
      shoppingItemRepository,
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
      id: 'item-1',
      recipeIngredientId: 'ingredient-1',
    });

    expect(result.recipeIngredientId).toBe('ingredient-1');
    expect(shoppingItemRepository.update).toHaveBeenCalledWith(existingItem);
  });

  it('throws NotFoundError when the shopping item does not exist', async () => {
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', recipeIngredientId: 'ingredient-1' }),
    ).rejects.toThrow(NotFoundError);
  });
});