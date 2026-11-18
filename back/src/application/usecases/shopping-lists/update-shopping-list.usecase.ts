import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface UpdateShoppingListCommand {
  id: string;
  name: string;
}

export interface UpdateShoppingListResult {
  id: string;
  householdId: string;
  name: string;
  choreId: string | null;
}

export class UpdateShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
  ) {}

  public async execute(
    command: UpdateShoppingListCommand,
  ): Promise<UpdateShoppingListResult> {
    const shoppingList = await this.shoppingListRepository.findById(
      command.id,
    );

    if (!shoppingList) {
      throw new NotFoundError(`Shopping list ${command.id} not found`);
    }

    shoppingList.rename(command.name.trim());

    await this.shoppingListRepository.update(shoppingList);

    return {
      id: shoppingList.id,
      householdId: shoppingList.householdId,
      name: shoppingList.name,
      choreId: shoppingList.choreId,
    };
  }
}