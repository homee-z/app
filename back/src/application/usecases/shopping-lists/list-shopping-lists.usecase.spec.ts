import { ListShoppingListsUseCase } from './list-shopping-lists.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';

describe('ListShoppingListsUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let useCase: ListShoppingListsUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListShoppingListsUseCase(shoppingListRepository);
  });

  it('returns all shopping lists for a household', async () => {
    const lists = [
      new ShoppingListEntity({
        id: 'list-1',
        householdId: 'household-1',
        name: 'Courses semaine',
      }),
      new ShoppingListEntity({
        id: 'list-2',
        householdId: 'household-1',
        name: 'Anniversaire',
      }),
    ];
    (
      shoppingListRepository.findAllByHousehold as jest.Mock
    ).mockResolvedValue(lists);

    const result = await useCase.execute({ householdId: 'household-1' });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Courses semaine');
    expect(result[1].name).toBe('Anniversaire');
  });

  it('returns an empty array when the household has no shopping list', async () => {
    (
      shoppingListRepository.findAllByHousehold as jest.Mock
    ).mockResolvedValue([]);

    const result = await useCase.execute({ householdId: 'household-1' });

    expect(result).toEqual([]);
  });
});