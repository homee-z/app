import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface GetShoppingListCommand {
  id: string;
}

export interface GetShoppingListResult {
  id: string;
  householdId: string;
  name: string;
  choreId: string | null;
}

export class GetShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
  ) {}

  public async execute(
    command: GetShoppingListCommand,
  ): Promise<GetShoppingListResult> {
    const shoppingList = await this.shoppingListRepository.findById(
      command.id,
    );

    if (!shoppingList) {
      throw new NotFoundError(`Shopping list ${command.id} not found`);
    }

    return {
      id: shoppingList.id,
      householdId: shoppingList.householdId,
      name: shoppingList.name,
      choreId: shoppingList.choreId,
    };
  }
}