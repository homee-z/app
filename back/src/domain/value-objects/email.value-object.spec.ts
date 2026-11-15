import { Email, InvalidEmailException } from './email.value-object';

describe('Email Value Object', () => {
  it('devrait créer un Email valide et le normaliser en minuscules et sans espaces', () => {
    const rawEmail = '  Karen.User@ESGI.FR ';
    const email = new Email(rawEmail);

    expect(email.getValue()).toBe('karen.user@esgi.fr');
  });

  it('devrait lever une InvalidEmailException pour un format incorrect', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidEmailException);
    expect(() => new Email('karen@esgi')).toThrow(InvalidEmailException);
    expect(() => new Email('')).toThrow(InvalidEmailException);
    expect(() => new Email('karen@.fr')).toThrow(InvalidEmailException);
  });

  it('devrait comparer correctement deux instances d\'Email avec equals()', () => {
    const email1 = new Email('test@homeez.fr');
    const email2 = new Email('TEST@homeez.fr');
    const email3 = new Email('autre@homeez.fr');

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});
