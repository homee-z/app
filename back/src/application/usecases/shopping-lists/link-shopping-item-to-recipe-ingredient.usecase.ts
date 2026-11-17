import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface LinkShoppingItemToRecipeIngredientCommand {
  id: string;
  recipeIngredientId: string;
}

export interface LinkShoppingItemToRecipeIngredientResult {
  id: string;
  shoppingListId: string;
  name: string;
  recipeIngredientId: string | null;
}

export class LinkShoppingItemToRecipeIngredientUseCase {
  constructor(
    private readonly shoppingItemRepository: ShoppingItemRepositoryInterface,
  ) {}

  public async execute(
    command: LinkShoppingItemToRecipeIngredientCommand,
  ): Promise<LinkShoppingItemToRecipeIngredientResult> {
    const shoppingItem = await this.shoppingItemRepository.findById(
      command.id,
    );

    if (!shoppingItem) {
      throw new NotFoundError(`Shopping item ${command.id} not found`);
    }

    shoppingItem.linkToRecipeIngredient(command.recipeIngredientId);

    await this.shoppingItemRepository.update(shoppingItem);

    return {
      id: shoppingItem.id,
      shoppingListId: shoppingItem.shoppingListId,
      name: shoppingItem.name,
      recipeIngredientId: shoppingItem.recipeIngredientId,
    };
  }
}