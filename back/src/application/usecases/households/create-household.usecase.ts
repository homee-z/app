import { randomUUID } from 'crypto';
import { Household } from '../../../domain/entities/household.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { generateUniqueCode } from './household-access';
import { HouseholdView, toHouseholdView } from './household-views';

export interface CreateHouseholdInput {
  name: string;
}

export class CreateHouseholdUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: HouseholdMemberRepositoryInterface,
  ) {}

  async execute(
    userId: string,
    input: CreateHouseholdInput,
  ): Promise<HouseholdView> {
    const household = new Household({
      id: randomUUID(),
      name: input.name,
      code: await generateUniqueCode(this.households),
    });
    // Premier foyer actif : il devient le foyer par défaut, dans la même transaction.
    const hasActive = (await this.members.findByUser(userId)).some((m) =>
      m.isActive(),
    );
    const admin = HouseholdMember.createAdmin(
      randomUUID(),
      userId,
      household.id,
      !hasActive,
    );

    await this.households.createWithAdmin(household, admin);
    return toHouseholdView(household, admin, 1);
  }
}
