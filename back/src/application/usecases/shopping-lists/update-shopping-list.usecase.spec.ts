import { UpdateShoppingListUseCase } from './update-shopping-list.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('UpdateShoppingListUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let useCase: UpdateShoppingListUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateShoppingListUseCase(shoppingListRepository);
  });

  it('renames an existing shopping list', async () => {
    const existingList = new ShoppingListEntity({
      id: 'list-1',
      householdId: 'household-1',
      name: 'Old name',
    });
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      existingList,
    );

    const result = await useCase.execute({
      id: 'list-1',
      name: '  New name  ',
    });

    expect(result.name).toBe('New name');
    expect(shoppingListRepository.update).toHaveBeenCalledWith(existingList);
  });

  it('throws NotFoundError when the shopping list does not exist', async () => {
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', name: 'New name' }),
    ).rejects.toThrow(NotFoundError);
  });
});