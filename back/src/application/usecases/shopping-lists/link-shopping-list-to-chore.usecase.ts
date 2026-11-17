import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface LinkShoppingListToChoreCommand {
  id: string;
  choreId: string;
}

export interface LinkShoppingListToChoreResult {
  id: string;
  householdId: string;
  name: string;
  choreId: string | null;
}

export class LinkShoppingListToChoreUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
  ) {}

  public async execute(
    command: LinkShoppingListToChoreCommand,
  ): Promise<LinkShoppingListToChoreResult> {
    const shoppingList = await this.shoppingListRepository.findById(
      command.id,
    );

    if (!shoppingList) {
      throw new NotFoundError(`Shopping list ${command.id} not found`);
    }

    shoppingList.linkToChore(command.choreId);

    await this.shoppingListRepository.update(shoppingList);

    return {
      id: shoppingList.id,
      householdId: shoppingList.householdId,
      name: shoppingList.name,
      choreId: shoppingList.choreId,
    };
  }
}