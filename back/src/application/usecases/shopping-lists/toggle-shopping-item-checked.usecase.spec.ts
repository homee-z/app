import { ToggleShoppingItemCheckedUseCase } from './toggle-shopping-item-checked.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('ToggleShoppingItemCheckedUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let useCase: ToggleShoppingItemCheckedUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ToggleShoppingItemCheckedUseCase(shoppingItemRepository);
  });

  it('toggles an unchecked item to checked', async () => {
    const existingItem = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-1',
      name: 'Lait',
      isChecked: false,
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      existingItem,
    );

    const result = await useCase.execute({ id: 'item-1' });

    expect(result.isChecked).toBe(true);
    expect(shoppingItemRepository.update).toHaveBeenCalledWith(existingItem);
  });

  it('toggles a checked item back to unchecked', async () => {
    const existingItem = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-1',
      name: 'Lait',
      isChecked: true,
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      existingItem,
    );

    const result = await useCase.execute({ id: 'item-1' });

    expect(result.isChecked).toBe(false);
  });

  it('throws NotFoundError when the shopping item does not exist', async () => {
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id' })).rejects.toThrow(
      NotFoundError,
    );
  });
});