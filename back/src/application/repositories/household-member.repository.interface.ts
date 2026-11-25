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

// Réservé au module Households (même provider HOUSEHOLD_MEMBER_REPOSITORY) : les autres
// modules n'en ont pas besoin, et leurs mocks n'ont donc pas à implémenter setDefault.
export interface DefaultHouseholdRepositoryInterface extends IHouseholdMemberRepository {
  // Fait de ce foyer le foyer par défaut de l'utilisateur et retire le flag des autres,
  // en une seule opération (transaction en Postgres).
  setDefault(userId: string, householdId: string): Promise<void>;
}
