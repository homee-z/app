import { AddShoppingItemUseCase } from './add-shopping-item.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';

describe('AddShoppingItemUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let useCase: AddShoppingItemUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new AddShoppingItemUseCase(shoppingItemRepository);
  });

  it('creates a new shopping item with default values', async () => {
    const result = await useCase.execute({
      shoppingListId: 'list-1',
      name: 'Lait',
    });

    expect(result.name).toBe('Lait');
    expect(result.shoppingListId).toBe('list-1');
    expect(result.quantity).toBeNull();
    expect(result.isChecked).toBe(false);
    expect(result.recipeIngredientId).toBeNull();
    expect(shoppingItemRepository.save).toHaveBeenCalledTimes(1);
  });

  it('creates a shopping item with a quantity', async () => {
    const result = await useCase.execute({
      shoppingListId: 'list-1',
      name: 'Oeufs',
      quantity: '1 douzaine',
    });

    expect(result.quantity).toBe('1 douzaine');
  });
});