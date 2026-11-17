import { CreateShoppingListUseCase } from './create-shopping-list.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';

describe('CreateShoppingListUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let useCase: CreateShoppingListUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateShoppingListUseCase(shoppingListRepository);
  });

  it('creates a shopping list and persists it via the repository', async () => {
    const result = await useCase.execute({
      householdId: 'household-1',
      name: '  Courses de la semaine  ',
    });

    expect(result.householdId).toBe('household-1');
    expect(result.name).toBe('Courses de la semaine');
    expect(result.choreId).toBeNull();
    expect(result.id).toBeDefined();

    expect(shoppingListRepository.save).toHaveBeenCalledTimes(1);
    const savedList = (shoppingListRepository.save as jest.Mock).mock
      .calls[0][0];
    expect(savedList.id).toBe(result.id);
  });

  it('accepts an optional choreId', async () => {
    const result = await useCase.execute({
      householdId: 'household-1',
      name: 'Courses',
      choreId: 'chore-1',
    });

    expect(result.choreId).toBe('chore-1');
  });
});