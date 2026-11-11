import { LoginUserUseCase } from './login-user.usecase';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IPasswordHasher } from '../services/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import {
  AccountLockedException,
  InvalidCredentialsException,
} from '../exceptions/auth.exceptions';

class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async findByEmail(email: Email): Promise<User | null> {
    const found = this.users.find((u) => u.email.equals(email));
    return found ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const found = this.users.find((u) => u.id === id);
    return found ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }
}

class FakePasswordHasher implements IPasswordHasher {
  async hash(plainText: string): Promise<string> {
    return `hashed_${plainText}`;
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return `hashed_${plainText}` === hash;
  }
}

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: InMemoryUserRepository;
  let passwordHasher: FakePasswordHasher;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    passwordHasher = new FakePasswordHasher();
    useCase = new LoginUserUseCase(userRepository, passwordHasher);
  });

  const createAndSaveUser = async (overrides?: Partial<any>) => {
    const user = new User({
      id: 'usr-123',
      email: new Email('karen@homeez.fr'),
      passwordHash: 'hashed_ValidPassword123!',
      firstName: 'Karen',
      lastName: 'ESGI',
      role: 'admin',
      isVerified: true,
      twoFactorEnabled: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      ...overrides,
    });
    await userRepository.save(user);
    return user;
  };

  it('devrait connecter un utilisateur avec les bons identifiants', async () => {
    await createAndSaveUser();

    const result = await useCase.execute({
      email: 'karen@homeez.fr',
      password: 'ValidPassword123!',
    });

    expect(result.userId).toBe('usr-123');
    expect(result.email).toBe('karen@homeez.fr');
    expect(result.requiresTwoFactor).toBe(false);
    expect(result.isPasswordExpired).toBe(false);
  });

  it('devrait renvoyer un message vague anti-énumération si l email n existe pas', async () => {
    await expect(
      useCase.execute({
        email: 'inexistant@homeez.fr',
        password: 'AnyPassword123!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('devrait renvoyer le même message vague si le mot de passe est faux', async () => {
    await createAndSaveUser();

    await expect(
      useCase.execute({
        email: 'karen@homeez.fr',
        password: 'WrongPassword123!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);

    // Vérifie que la tentative échouée a été enregistrée
    const user = await userRepository.findById('usr-123');
    expect(user?.failedLoginAttempts).toBe(1);
  });

  it('devrait verrouiller le compte après 5 tentatives échouées et bloquer la connexion', async () => {
    await createAndSaveUser();

    // 4 échecs
    for (let i = 0; i < 4; i++) {
      await expect(
        useCase.execute({
          email: 'karen@homeez.fr',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(InvalidCredentialsException);
    }

    // 5ème échec : verrouille le compte
    await expect(
      useCase.execute({
        email: 'karen@homeez.fr',
        password: 'WrongPassword123!',
      }),
    ).rejects.toThrow(InvalidCredentialsException);

    // 6ème tentative : rejeté immédiatement avec AccountLockedException
    await expect(
      useCase.execute({
        email: 'karen@homeez.fr',
        password: 'ValidPassword123!',
      }),
    ).rejects.toThrow(AccountLockedException);
  });

  it('devrait signaler qu un mot de passe a expiré (CNIL 60 jours)', async () => {
    const sixtyOneDaysAgo = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000);
    await createAndSaveUser({ passwordChangedAt: sixtyOneDaysAgo });

    const result = await useCase.execute({
      email: 'karen@homeez.fr',
      password: 'ValidPassword123!',
    });

    expect(result.isPasswordExpired).toBe(true);
  });
});
