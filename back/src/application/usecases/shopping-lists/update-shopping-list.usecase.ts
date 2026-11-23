import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { requireActiveMember } from '../households/household-access';

export interface UpdateShoppingListCommand {
  userId: string;
  householdId: string;
  id: string;
  name: string;
}

export interface UpdateShoppingListResult {
  id: string;
  householdId: string;
  name: string;
  choreId: string | null;
}

export class UpdateShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: UpdateShoppingListCommand,
  ): Promise<UpdateShoppingListResult> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const shoppingList = await this.shoppingListRepository.findById(
      command.id,
    );

    if (!shoppingList || shoppingList.householdId !== command.householdId) {
      throw new NotFoundError(`Shopping list ${command.id} not found`);
    }

    shoppingList.rename(command.name.trim());

    await this.shoppingListRepository.update(shoppingList);

    return {
      id: shoppingList.id,
      householdId: shoppingList.householdId,
      name: shoppingList.name,
      choreId: shoppingList.choreId,
    };
  }
}