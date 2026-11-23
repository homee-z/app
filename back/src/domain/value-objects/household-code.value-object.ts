import { randomBytes } from 'crypto';
import { DomainError } from '../errors/domain.error';

// Sans 0/O/1/I pour éviter les confusions à la saisie
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LENGTH = 6;
const PATTERN = new RegExp(`^[${ALPHABET}]{${LENGTH}}$`);

export class InvalidHouseholdCodeException extends DomainError {
  constructor(code: string) {
    super(`Le code foyer "${code}" est invalide.`);
    this.name = 'InvalidHouseholdCodeException';
  }
}

export class HouseholdCode {
  public readonly value: string;

  constructor(value?: string) {
    const code = (value ?? HouseholdCode.generate()).toUpperCase().trim();
    if (!HouseholdCode.isValid(code)) {
      throw new InvalidHouseholdCodeException(code);
    }
    this.value = code;
  }

  // 256 est un multiple de 32 : le modulo ne favorise aucune lettre
  static generate(): string {
    const bytes = randomBytes(LENGTH);
    return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
  }

  static isValid(code: string): boolean {
    return PATTERN.test(code);
  }

  equals(other: HouseholdCode): boolean {
    return this.value === other.value;
  }
}
