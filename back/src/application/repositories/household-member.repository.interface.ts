import { HouseholdMember } from '../../domain/entities/household-member.entity';

export const HOUSEHOLD_MEMBER_REPOSITORY = Symbol(
  'HOUSEHOLD_MEMBER_REPOSITORY',
);

export interface IHouseholdMemberRepository {
  findOne(householdId: string, userId: string): Promise<HouseholdMember | null>;
  findByUser(userId: string): Promise<HouseholdMember[]>;
  findByHousehold(householdId: string): Promise<HouseholdMember[]>;
  countActiveAdmins(householdId: string): Promise<number>;
  save(member: HouseholdMember): Promise<void>;
  delete(id: string): Promise<void>;
}

export type HouseholdMemberRepositoryInterface = IHouseholdMemberRepository;
