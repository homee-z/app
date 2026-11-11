import { User } from './user.entity';
import { Email } from '../value-objects/email.value-object';

describe('User Entity (Domain Business Rules)', () => {
  const createValidUser = (overrides?: Partial<any>) => {
    return new User({
      id: 'usr-123',
      email: new Email('karen@homeez.fr'),
      passwordHash: '$2b$12$hashedPasswordExample',
      firstName: 'Karen',
      lastName: 'ESGI',
      role: 'admin',
      isVerified: false,
      twoFactorEnabled: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      ...overrides,
    });
  };

  it('devrait instancier correctement un Utilisateur', () => {
    const user = createValidUser();

    expect(user.id).toBe('usr-123');
    expect(user.email.getValue()).toBe('karen@homeez.fr');
    expect(user.firstName).toBe('Karen');
    expect(user.lastName).toBe('ESGI');
    expect(user.role).toBe('admin');
    expect(user.isVerified).toBe(false);
    expect(user.isLocked()).toBe(false);
  });

  it('devrait verrouiller le compte après 5 tentatives de connexion échouées (Règle CNIL)', () => {
    const user = createValidUser();

    // 4 échecs consécutifs : toujours déverrouillé
    for (let i = 0; i < 4; i++) {
      user.recordFailedLogin();
      expect(user.isLocked()).toBe(false);
    }

    // 5ème échec : le compte se verrouille
    user.recordFailedLogin();
    expect(user.failedLoginAttempts).toBe(5);
    expect(user.isLocked()).toBe(true);
    expect(user.lockUntil).not.toBeNull();
  });

  it('devrait réinitialiser le nombre d\'échecs lors d\'une connexion réussie', () => {
    const user = createValidUser();

    user.recordFailedLogin();
    user.recordFailedLogin();
    expect(user.failedLoginAttempts).toBe(2);

    user.recordSuccessfulLogin();
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.isLocked()).toBe(false);
    expect(user.lockUntil).toBeNull();
  });

  it('devrait détecter un mot de passe expiré après 60 jours (Règle CNIL)', () => {
    const sixtyOneDaysAgo = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000);
    const user = createValidUser({ passwordChangedAt: sixtyOneDaysAgo });

    expect(user.isPasswordExpired(60)).toBe(true);
  });

  it('devrait ne pas considérer expiré un mot de passe récent', () => {
    const user = createValidUser({ passwordChangedAt: new Date() });

    expect(user.isPasswordExpired(60)).toBe(false);
  });

  it('devrait permettre de valider l\'email', () => {
    const user = createValidUser({ verificationToken: 'tok-123' });
    expect(user.isVerified).toBe(false);

    user.verifyEmail();
    expect(user.isVerified).toBe(true);
    expect(user.verificationToken).toBeNull();
  });

  it('devrait activer et désactiver la double authentification 2FA', () => {
    const user = createValidUser();

    user.enableTwoFactor('secret_totp_key');
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.twoFactorSecret).toBe('secret_totp_key');

    user.disableTwoFactor();
    expect(user.twoFactorEnabled).toBe(false);
    expect(user.twoFactorSecret).toBeNull();
  });
});
