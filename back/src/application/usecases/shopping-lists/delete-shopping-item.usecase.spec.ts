import { DeleteShoppingItemUseCase } from './delete-shopping-item.usecase';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('DeleteShoppingItemUseCase', () => {
  let shoppingItemRepository: ShoppingItemRepositoryInterface;
  let useCase: DeleteShoppingItemUseCase;

  beforeEach(() => {
    shoppingItemRepository = {
      findById: jest.fn(),
      findAllByList: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteShoppingItemUseCase(shoppingItemRepository);
  });

  it('deletes an existing shopping item', async () => {
    const existingItem = new ShoppingItemEntity({
      id: 'item-1',
      shoppingListId: 'list-1',
      name: 'Lait',
    });
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(
      existingItem,
    );

    await useCase.execute({ id: 'item-1' });

    expect(shoppingItemRepository.delete).toHaveBeenCalledWith('item-1');
  });

  it('throws NotFoundError and does not call delete when the item does not exist', async () => {
    (shoppingItemRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id' })).rejects.toThrow(
      NotFoundError,
    );
    expect(shoppingItemRepository.delete).not.toHaveBeenCalled();
  });
});