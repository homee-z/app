import validator from 'validator';
import { DomainError } from '../errors/domain.error';

export class InvalidEmailException extends DomainError {
  constructor(email: string) {
    super(`L'adresse email "${email}" est invalide.`);
    this.name = 'InvalidEmailException';
  }
}

export class Email {
  public readonly value: string;

  constructor(value: string) {
    const cleanedEmail = value?.trim().toLowerCase();
    if (!cleanedEmail || !validator.isEmail(cleanedEmail)) {
      throw new InvalidEmailException(value);
    }
    this.value = cleanedEmail;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    if (!other) return false;
    return this.value === other.getValue();
  }
}
