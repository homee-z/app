import validator from 'validator';

export class InvalidEmailException extends Error {
  constructor(email: string) {
    super(`L'adresse email "${email}" est invalide.`);
    this.name = 'InvalidEmailException';
  }
}

export class Email {
  private readonly value: string;

  constructor(email: string) {
    const cleanedEmail = email?.trim().toLowerCase();
    if (!cleanedEmail || !validator.isEmail(cleanedEmail)) {
      throw new InvalidEmailException(email);
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
