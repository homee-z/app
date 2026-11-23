import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { requireActiveMember } from '../households/household-access';

export interface LinkShoppingItemToRecipeIngredientCommand {
  userId: string;
  householdId: string;
  shoppingListId: string;
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
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: LinkShoppingItemToRecipeIngredientCommand,
  ): Promise<LinkShoppingItemToRecipeIngredientResult> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const shoppingList = await this.shoppingListRepository.findById(
      command.shoppingListId,
    );

    if (!shoppingList || shoppingList.householdId !== command.householdId) {
      throw new NotFoundError(
        `Shopping list ${command.shoppingListId} not found`,
      );
    }

    const shoppingItem = await this.shoppingItemRepository.findById(
      command.id,
    );

    if (!shoppingItem || shoppingItem.shoppingListId !== command.shoppingListId) {
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