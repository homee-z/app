export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Un compte avec l'adresse email "${email}" existe déjà.`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class WeakPasswordException extends Error {
  constructor(message?: string) {
    super(
      message ??
        'Le mot de passe ne respecte pas la politique de sécurité CNIL : minimum 12 caractères, avec au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.',
    );
    this.name = 'WeakPasswordException';
  }
}

export class InvalidCredentialsException extends Error {
  constructor() {
    super('Identifiants incorrects (email ou mot de passe invalide).');
    this.name = 'InvalidCredentialsException';
  }
}

export class AccountLockedException extends Error {
  constructor(minutesRemaining: number) {
    super(
      `Compte temporairement verrouillé pour des raisons de sécurité suite à 5 tentatives infructueuses. Veuillez réessayer dans ${minutesRemaining} minute(s).`,
    );
    this.name = 'AccountLockedException';
  }
}

export class UserNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Utilisateur "${identifier}" introuvable.`);
    this.name = 'UserNotFoundException';
  }
}
