import { UpdateShoppingItemUseCase } from './update-shopping-item.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('UpdateShoppingItemUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let useCase: UpdateShoppingItemUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateShoppingItemUseCase(shoppingItemRepository);
  });

  it('updates the name of an existing shopping item', async () => {
    const existingItem = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-1',
      name: 'Lait',
      quantity: '1L',
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      existingItem,
    );

    const result = await useCase.execute({ id: 'item-1', name: 'Lait entier' });

    expect(result.name).toBe('Lait entier');
    expect(result.quantity).toBe('1L');
    expect(shoppingItemRepository.update).toHaveBeenCalledWith(existingItem);
  });

  it('updates the quantity of an existing shopping item', async () => {
    const existingItem = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-1',
      name: 'Lait',
      quantity: '1L',
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      existingItem,
    );

    const result = await useCase.execute({ id: 'item-1', quantity: '2L' });

    expect(result.quantity).toBe('2L');
    expect(result.name).toBe('Lait');
  });

  it('throws NotFoundError when the shopping item does not exist', async () => {
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', name: 'X' }),
    ).rejects.toThrow(NotFoundError);
  });
});