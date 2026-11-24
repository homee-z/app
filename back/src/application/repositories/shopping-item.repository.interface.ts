import { ShoppingItemEntity } from '../../domain/entities/shopping-item.entity';

export const SHOPPING_ITEM_REPOSITORY = Symbol('SHOPPING_ITEM_REPOSITORY');

export interface ShoppingItemRepositoryInterface {
  findById(id: string): Promise<ShoppingItemEntity | null>;
  findAllByList(shoppingListId: string): Promise<ShoppingItemEntity[]>;
  save(shoppingItem: ShoppingItemEntity): Promise<void>;
  update(shoppingItem: ShoppingItemEntity): Promise<void>;
  delete(id: string): Promise<void>;
}