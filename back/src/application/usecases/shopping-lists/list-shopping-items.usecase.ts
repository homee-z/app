import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';

export interface ListShoppingItemsCommand {
  shoppingListId: string;
}

export interface ShoppingItemSummary {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string | null;
  isChecked: boolean;
  recipeIngredientId: string | null;
}

export class ListShoppingItemsUseCase {
  constructor(
    private readonly shoppingItemRepository: ShoppingItemRepositoryInterface,
  ) {}

  public async execute(
    command: ListShoppingItemsCommand,
  ): Promise<ShoppingItemSummary[]> {
    const shoppingItems = await this.shoppingItemRepository.findAllByList(
      command.shoppingListId,
    );

    return shoppingItems.map((shoppingItem) => ({
      id: shoppingItem.id,
      shoppingListId: shoppingItem.shoppingListId,
      name: shoppingItem.name,
      quantity: shoppingItem.quantity,
      isChecked: shoppingItem.isChecked,
      recipeIngredientId: shoppingItem.recipeIngredientId,
    }));
  }
}