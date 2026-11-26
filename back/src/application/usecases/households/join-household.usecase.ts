import { randomUUID } from 'crypto';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { HouseholdRepositoryInterface } from '../../repositories/household.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { HouseholdView, toHouseholdView } from './household-views';

export interface JoinHouseholdInput {
  code: string;
}

// Crée une demande en attente, qu'un admin devra valider.
export class JoinHouseholdUsecase {
  constructor(
    private readonly households: HouseholdRepositoryInterface,
    private readonly members: HouseholdMemberRepositoryInterface,
  ) {}

  async execute(
    userId: string,
    input: JoinHouseholdInput,
  ): Promise<HouseholdView> {
    // Code mal formé : InvalidHouseholdCodeException (400).
    const code = new HouseholdCode(input.code);
    const household = await this.households.findByCode(code);
    if (!household) throw new NotFoundError('Household not found');

    const existing = await this.members.findOne(household.id, userId);
    if (existing) {
      throw new ConflictError(
        existing.isPending()
          ? 'Join request already pending'
          : 'Already a member of this household',
      );
    }

    const request = HouseholdMember.requestToJoin(
      randomUUID(),
      userId,
      household.id,
    );
    await this.members.save(request);

    const active = (await this.members.findByHousehold(household.id)).filter(
      (m) => m.isActive(),
    );
    return toHouseholdView(household, request, active.length);
  }
}
