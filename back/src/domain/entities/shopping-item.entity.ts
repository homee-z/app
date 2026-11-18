export interface ShoppingItemProps {
  id: string;
  shoppingListId: string;
  name: string;
  quantity?: string | null;
  isChecked?: boolean;
  recipeIngredientId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ShoppingItemEntity {
  public readonly id: string;
  public readonly shoppingListId: string;
  public name: string;
  public quantity: string | null;
  public isChecked: boolean;
  public recipeIngredientId: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ShoppingItemProps) {
    this.id = props.id;
    this.shoppingListId = props.shoppingListId;
    this.name = props.name;
    this.quantity = props.quantity ?? null;
    this.isChecked = props.isChecked ?? false;
    this.recipeIngredientId = props.recipeIngredientId ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public rename(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  public updateQuantity(quantity: string | null): void {
    this.quantity = quantity;
    this.updatedAt = new Date();
  }

  public toggleChecked(): void {
    this.isChecked = !this.isChecked;
    this.updatedAt = new Date();
  }

  public linkToRecipeIngredient(recipeIngredientId: string): void {
    this.recipeIngredientId = recipeIngredientId;
    this.updatedAt = new Date();
  }

  public unlinkFromRecipeIngredient(): void {
    this.recipeIngredientId = null;
    this.updatedAt = new Date();
  }
}