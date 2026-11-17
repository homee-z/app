import { Household } from '../../domain/entities/household.entity';
import { HouseholdMember } from '../../domain/entities/household-member.entity';
import { HouseholdCode } from '../../domain/value-objects/household-code.value-object';

export const HOUSEHOLD_REPOSITORY = Symbol('HOUSEHOLD_REPOSITORY');

export interface IHouseholdRepository {
  findById(id: string): Promise<Household | null>;
  findByCode(code: HouseholdCode | string): Promise<Household | null>;
  findByIds(ids: string[]): Promise<Household[]>;
  save(household: Household): Promise<void>;
  // Crée le foyer et son premier admin en une seule opération (transaction en Postgres),
  // pour ne jamais avoir de foyer sans admin.
  createWithAdmin(household: Household, admin: HouseholdMember): Promise<void>;
  // Supprime le foyer et toutes ses adhésions (ON DELETE CASCADE en Postgres).
  delete(id: string): Promise<void>;
}

export type HouseholdRepositoryInterface = IHouseholdRepository;
