import { randomUUID } from 'crypto';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';

export interface CreateShoppingListCommand {
  userId: string;
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
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: CreateShoppingListCommand,
  ): Promise<CreateShoppingListResult> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

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