import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';

export interface ListShoppingListsCommand {
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
  ) {}

  public async execute(
    command: ListShoppingListsCommand,
  ): Promise<ShoppingListSummary[]> {
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