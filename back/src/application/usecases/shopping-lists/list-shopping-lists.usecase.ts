import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';

export interface ListShoppingListsCommand {
  userId: string;
  householdId: string;
}

export interface ShoppingListSummary {
  id: string;
  householdId: string;
  name: string;
  choreId: string | null;
}

export class ListShoppingListsUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: ListShoppingListsCommand,
  ): Promise<ShoppingListSummary[]> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const shoppingLists = await this.shoppingListRepository.findAllByHousehold(
      command.householdId,
    );

    return shoppingLists.map((shoppingList) => ({
      id: shoppingList.id,
      householdId: shoppingList.householdId,
      name: shoppingList.name,
      choreId: shoppingList.choreId,
    }));
  }
}