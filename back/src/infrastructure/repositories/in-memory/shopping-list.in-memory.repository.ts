import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListRepositoryInterface } from '../../../application/repositories/shopping-list.repository.interface';

// Copie défensive : comme pour User, modifier une ShoppingList sans save/update ne change pas le stock.
const clone = (list: ShoppingListEntity): ShoppingListEntity =>
  new ShoppingListEntity({
    id: list.id,
    householdId: list.householdId,
    name: list.name,
    choreId: list.choreId,
    createdAt: new Date(list.createdAt),
    updatedAt: new Date(list.updatedAt),
  });

export class ShoppingListInMemoryRepository
  implements ShoppingListRepositoryInterface
{
  private shoppingLists: ShoppingListEntity[] = [];

  async findById(id: string) {
    const found = this.shoppingLists.find((list) => list.id === id);
    return found ? clone(found) : null;
  }

  async findAllByHousehold(householdId: string) {
    return this.shoppingLists
      .filter((list) => list.householdId === householdId)
      .map(clone);
  }

  async save(shoppingList: ShoppingListEntity) {
    const copy = clone(shoppingList);
    const index = this.shoppingLists.findIndex((l) => l.id === copy.id);
    if (index >= 0) this.shoppingLists[index] = copy;
    else this.shoppingLists.push(copy);
  }

  async update(shoppingList: ShoppingListEntity) {
    await this.save(shoppingList);
  }

  async delete(id: string) {
    this.shoppingLists = this.shoppingLists.filter((l) => l.id !== id);
  }
}