import { DomainError } from '../errors/domain.error';
import { HouseholdCode } from '../value-objects/household-code.value-object';

export const HOUSEHOLD_NAME_MIN = 2;
export const HOUSEHOLD_NAME_MAX = 50;

export class InvalidHouseholdNameException extends DomainError {
  constructor() {
    super(
      `Le nom du foyer doit contenir entre ${HOUSEHOLD_NAME_MIN} et ${HOUSEHOLD_NAME_MAX} caractères.`,
    );
    this.name = 'InvalidHouseholdNameException';
  }
}

export interface HouseholdProps {
  id: string;
  name: string;
  code?: HouseholdCode;
  createdAt?: Date;
}

export class Household {
  public readonly id: string;
  public name!: string;
  public code: HouseholdCode;
  public readonly createdAt: Date;

  constructor(props: HouseholdProps) {
    this.id = props.id;
    this.rename(props.name);
    this.code = props.code ?? new HouseholdCode();
    this.createdAt = props.createdAt ?? new Date();
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (
      trimmed.length < HOUSEHOLD_NAME_MIN ||
      trimmed.length > HOUSEHOLD_NAME_MAX
    ) {
      throw new InvalidHouseholdNameException();
    }
    this.name = trimmed;
  }

  regenerateCode(): void {
    this.code = new HouseholdCode();
  }
}
