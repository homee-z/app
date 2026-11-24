import { LinkShoppingListToChoreUseCase } from './link-shopping-list-to-chore.usecase';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('LinkShoppingListToChoreUseCase', () => {
  let shoppingListRepository: ShoppingListRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: LinkShoppingListToChoreUseCase;

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

    useCase = new LinkShoppingListToChoreUseCase(
      shoppingListRepository,
      householdMemberRepository,
    );
  });

  it('links an existing shopping list to a chore when the user is an active member', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
    const existingList = new ShoppingListEntity({
      id: 'list-1',
      householdId: 'household-1',
      name: 'Courses',
    });
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      existingList,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      id: 'list-1',
      choreId: 'chore-1',
    });

    expect(result.choreId).toBe('chore-1');
    expect(shoppingListRepository.update).toHaveBeenCalledWith(existingList);
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        id: 'list-1',
        choreId: 'chore-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when the shopping list belongs to another household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
    const otherHouseholdList = new ShoppingListEntity({
      id: 'list-1',
      householdId: 'household-2',
      name: 'Courses',
    });
    (shoppingListRepository.findById as jest.Mock).mockResolvedValue(
      otherHouseholdList,
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        id: 'list-1',
        choreId: 'chore-1',
      }),
    ).rejects.toThrow(NotFoundError);
  });
});