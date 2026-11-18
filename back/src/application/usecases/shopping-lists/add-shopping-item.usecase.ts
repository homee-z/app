import { randomUUID } from 'crypto';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';

export interface AddShoppingItemCommand {
  shoppingListId: string;
  name: string;
  quantity?: string | null;
}

export interface AddShoppingItemResult {
  id: string;
  shoppingListId: string;
  name: string;
  quantity: string | null;
  isChecked: boolean;
  recipeIngredientId: string | null;
}

export class AddShoppingItemUseCase {
  constructor(
    private readonly shoppingItemRepository: ShoppingItemRepositoryInterface,
  ) {}

  public async execute(
    command: AddShoppingItemCommand,
  ): Promise<AddShoppingItemResult> {
    const shoppingItem = new ShoppingItemEntity({
      id: randomUUID(),
      shoppingListId: command.shoppingListId,
      name: command.name,
      quantity: command.quantity ?? null,
    });

    await this.shoppingItemRepository.save(shoppingItem);

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