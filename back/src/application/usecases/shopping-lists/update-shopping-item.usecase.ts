import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface UpdateShoppingItemCommand {
  id: string;
  name?: string;
  quantity?: string | null;
}

export interface UpdateShoppingItemResult {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string | null;
  isChecked: boolean;
  recipeIngredientId: string | null;
}

export class UpdateShoppingItemUseCase {
  constructor(
    private readonly shoppingItemRepository: ShoppingItemRepositoryInterface,
  ) {}

  public async execute(
    command: UpdateShoppingItemCommand,
  ): Promise<UpdateShoppingItemResult> {
    const shoppingItem = await this.shoppingItemRepository.findById(
      command.id,
    );

    if (!shoppingItem) {
      throw new NotFoundError(`Shopping item ${command.id} not found`);
    }

    if (command.name !== undefined) {
      shoppingItem.rename(command.name);
    }

    if (command.quantity !== undefined) {
      shoppingItem.updateQuantity(command.quantity);
    }

    await this.shoppingItemRepository.update(shoppingItem);

    return {
      id: shoppingItem.id,
      shoppingListId: shoppingItem.shoppingListId,
      name: shoppingItem.name,
      quantity: shoppingItem.quantity,
      isChecked: shoppingItem.isChecked,
      recipeIngredientId: shoppingItem.recipeIngredientId,
    };
  }
}