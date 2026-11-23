import { ListShoppingListsUseCase } from './list-shopping-lists.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('ListShoppingListsUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: ListShoppingListsUseCase;

  beforeEach(() => {
    shoppingListRepository = {
      findById: jest.fn(),
      findAllByHousehold: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    householdMemberRepository = {
      findOne: jest.fn(),
      findByUser: jest.fn(),
      findByHousehold: jest.fn(),
      countActiveAdmins: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListShoppingListsUseCase(
      shoppingListRepository,
      householdMemberRepository,
    );
  });

  it('returns all shopping lists for a household when the user is an active member', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
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

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
    });

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Courses semaine');
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-1', householdId: 'household-1' }),
    ).rejects.toThrow(NotFoundError);
    expect(shoppingListRepository.findAllByHousehold).not.toHaveBeenCalled();
  });
});