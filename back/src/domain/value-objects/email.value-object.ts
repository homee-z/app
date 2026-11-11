import { DomainError } from '../errors/domain.error';

export class Email {
  public readonly value: string;

  constructor(value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new DomainError('Invalid email format');
    }
    this.value = value.toLowerCase();
  }
}
