import { randomUUID } from 'crypto';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';

export interface CreateShoppingListCommand {
  householdId: string;
  name: string;
  choreId?: string | null;
}

export interface CreateShoppingListResult {
  id: string;
  householdId: string;
  name: string;
  choreId: string | null;
}

export class CreateShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
  ) {}

  public async execute(
    command: CreateShoppingListCommand,
  ): Promise<CreateShoppingListResult> {
    const shoppingList = new ShoppingListEntity({
      id: randomUUID(),
      householdId: command.householdId,
      name: command.name.trim(),
      choreId: command.choreId ?? null,
    });

    await this.shoppingListRepository.save(shoppingList);

    return {
      id: shoppingList.id,
      householdId: shoppingList.householdId,
      name: shoppingList.name,
      choreId: shoppingList.choreId,
    };
  }
}