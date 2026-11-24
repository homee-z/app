export interface ShoppingListProps {
  id: string;
  householdId: string;
  name: string;
  choreId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ShoppingListEntity {
  public readonly id: string;
  public readonly householdId: string;
  public name: string;
  public choreId: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ShoppingListProps) {
    this.id = props.id;
    this.householdId = props.householdId;
    this.name = props.name;
    this.choreId = props.choreId ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public rename(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  public linkToChore(choreId: string): void {
    this.choreId = choreId;
    this.updatedAt = new Date();
  }

  public unlinkFromChore(): void {
    this.choreId = null;
    this.updatedAt = new Date();
  }
}