import { LinkShoppingListToChoreUseCase } from './link-shopping-list-to-chore.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('LinkShoppingListToChoreUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let useCase: LinkShoppingListToChoreUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new LinkShoppingListToChoreUseCase(shoppingListRepository);
  });

  it('links an existing shopping list to a chore', async () => {
    const existingList = new ShoppingListEntity({
      id: 'list-1',
      householdId: 'household-1',
      name: 'Courses',
    });
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      existingList,
    );

    const result = await useCase.execute({
      id: 'list-1',
      choreId: 'chore-1',
    });

    expect(result.choreId).toBe('chore-1');
    expect(shoppingListRepository.update).toHaveBeenCalledWith(existingList);
  });

  it('throws NotFoundError when the shopping list does not exist', async () => {
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing-id', choreId: 'chore-1' }),
    ).rejects.toThrow(NotFoundError);
  });
});