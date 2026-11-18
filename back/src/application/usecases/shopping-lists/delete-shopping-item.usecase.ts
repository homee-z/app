import { ShoppingItemRepositoryInterface } from '../../repositories/shopping-item.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

export interface DeleteShoppingItemCommand {
  id: string;
}

export class DeleteShoppingItemUseCase {
  constructor(
    private readonly shoppingItemRepository: ShoppingItemRepositoryInterface,
  ) {}

  public async execute(command: DeleteShoppingItemCommand): Promise<void> {
    const shoppingItem = await this.shoppingItemRepository.findById(
      command.id,
    );

    if (!shoppingItem) {
      throw new NotFoundError(`Shopping item ${command.id} not found`);
    }

    await this.shoppingItemRepository.delete(command.id);
  }
}