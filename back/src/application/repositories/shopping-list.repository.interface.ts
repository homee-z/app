import { ShoppingListEntity } from '../../domain/entities/shopping-list.entity';

export const SHOPPING_LIST_REPOSITORY = Symbol('SHOPPING_LIST_REPOSITORY');

export interface ShoppingListRepositoryInterface {
  findById(id: string): Promise<ShoppingListEntity | null>;
  findAllByHousehold(householdId: string): Promise<ShoppingListEntity[]>;
  save(shoppingList: ShoppingListEntity): Promise<void>;
  update(shoppingList: ShoppingListEntity): Promise<void>;
  delete(id: string): Promise<void>;
}