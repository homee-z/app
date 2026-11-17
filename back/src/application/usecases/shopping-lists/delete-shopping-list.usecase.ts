import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface DeleteShoppingListCommand {
  id: string;
}

export class DeleteShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
  ) {}

  public async execute(command: DeleteShoppingListCommand): Promise<void> {
    const shoppingList = await this.shoppingListRepository.findById(
      command.id,
    );

    if (!shoppingList) {
      throw new NotFoundError(`Shopping list ${command.id} not found`);
    }

    await this.shoppingListRepository.delete(command.id);
  }
}