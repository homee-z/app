import { randomUUID } from 'crypto';
import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { requireActiveMember } from '../households/household-access';

export interface AddShoppingItemCommand {
  userId: string;
  householdId: string;
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
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: AddShoppingItemCommand,
  ): Promise<AddShoppingItemResult> {
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