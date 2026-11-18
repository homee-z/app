import { DeleteShoppingListUseCase } from './delete-shopping-list.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('DeleteShoppingListUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let useCase: DeleteShoppingListUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteShoppingListUseCase(shoppingListRepository);
  });

  it('deletes an existing shopping list', async () => {
    const existingList = new ShoppingListEntity({
      id: 'list-1',
      householdId: 'household-1',
      name: 'Courses',
    });
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      existingList,
    );

    await useCase.execute({ id: 'list-1' });

    expect(shoppingListRepository.delete).toHaveBeenCalledWith('list-1');
  });

  it('throws NotFoundError when the shopping list does not exist', async () => {
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id' })).rejects.toThrow(
      NotFoundError,
    );
    expect(shoppingListRepository.delete).not.toHaveBeenCalled();
  });
});