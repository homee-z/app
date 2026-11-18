import { ListShoppingItemsUseCase } from './list-shopping-items.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';

describe('ListShoppingItemsUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let useCase: ListShoppingItemsUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListShoppingItemsUseCase(shoppingItemRepository);
  });

  it('returns all items for a shopping list', async () => {
    const items = [
      new ShoppingItemEntity({
        id: 'item-1',
        shoppingListId: 'list-1',
        name: 'Lait',
        quantity: '1L',
      }),
      new ShoppingItemEntity({
        id: 'item-2',
        shoppingListId: 'list-1',
        name: 'Oeufs',
      }),
    ];
    (shoppingItemRepository.findAllByList as jest.Mock).mockResolvedValue(
      items,
    );

    const result = await useCase.execute({ shoppingListId: 'list-1' });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Lait');
    expect(result[1].quantity).toBeNull();
  });

  it('returns an empty array when the shopping list has no item', async () => {
    (shoppingItemRepository.findAllByList as jest.Mock).mockResolvedValue([]);

    const result = await useCase.execute({ shoppingListId: 'list-1' });

    expect(result).toEqual([]);
  });
});