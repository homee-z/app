import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { ShoppingItemRepositoryInterface } from '../../../application/repositories/shopping-item.repository.interface';

// Copie défensive : comme pour User et ShoppingList, modifier un item sans save/update ne change pas le stock.
const clone = (item: ShoppingItemEntity): ShoppingItemEntity =>
  new ShoppingItemEntity({
    id: item.id,
    shoppingListId: item.shoppingListId,
    name: item.name,
    quantity: item.quantity,
    isChecked: item.isChecked,
    recipeIngredientId: item.recipeIngredientId,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });

export class ShoppingItemInMemoryRepository
  implements ShoppingItemRepositoryInterface
{
  private shoppingItems: ShoppingItemEntity[] = [];

  async findById(id: string) {
    const found = this.shoppingItems.find((item) => item.id === id);
    return found ? clone(found) : null;
  }

  async findAllByList(shoppingListId: string) {
    return this.shoppingItems
      .filter((item) => item.shoppingListId === shoppingListId)
      .map(clone);
  }

  async save(shoppingItem: ShoppingItemEntity) {
    const copy = clone(shoppingItem);
    const index = this.shoppingItems.findIndex((i) => i.id === copy.id);
    if (index >= 0) this.shoppingItems[index] = copy;
    else this.shoppingItems.push(copy);
  }

  async update(shoppingItem: ShoppingItemEntity) {
    await this.save(shoppingItem);
  }

  async delete(id: string) {
    this.shoppingItems = this.shoppingItems.filter((i) => i.id !== id);
  }
}