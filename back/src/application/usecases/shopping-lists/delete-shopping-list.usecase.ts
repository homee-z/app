import { ShoppingListRepositoryInterface } from '../../repositories/shopping-list.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { requireActiveMember } from '../households/household-access';

export interface DeleteShoppingListCommand {
  userId: string;
  householdId: string;
  id: string;
}

export class DeleteShoppingListUseCase {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(command: DeleteShoppingListCommand): Promise<void> {
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

    await this.shoppingListRepository.delete(command.id);
  }
}