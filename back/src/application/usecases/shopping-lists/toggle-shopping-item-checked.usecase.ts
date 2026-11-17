import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface ToggleShoppingItemCheckedCommand {
  id: string;
}

export interface ToggleShoppingItemCheckedResult {
  id: string;
  shoppingListId: string;
  name: string;
  isChecked: boolean;
}

export class ToggleShoppingItemCheckedUseCase {
  constructor(
    private readonly shoppingItemRepository: ShoppingItemRepositoryInterface,
  ) {}

  public async execute(
    command: ToggleShoppingItemCheckedCommand,
  ): Promise<ToggleShoppingItemCheckedResult> {
    const shoppingItem = await this.shoppingItemRepository.findById(
      command.id,
    );

    if (!shoppingItem) {
      throw new NotFoundError(`Shopping item ${command.id} not found`);
    }

    shoppingItem.toggleChecked();

    await this.shoppingItemRepository.update(shoppingItem);

    return {
      id: shoppingItem.id,
      shoppingListId: shoppingItem.shoppingListId,
      name: shoppingItem.name,
      isChecked: shoppingItem.isChecked,
    };
  }
}