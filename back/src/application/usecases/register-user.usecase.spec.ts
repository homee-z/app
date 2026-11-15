import { RegisterUserUseCase } from './register-user.usecase';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IPasswordHasher } from '../services/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { Email, InvalidEmailException } from '../../domain/value-objects/email.value-object';
import {
  UserAlreadyExistsException,
  WeakPasswordException,
} from '../exceptions/auth.exceptions';

class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

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

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: InMemoryUserRepository;
  let passwordHasher: FakePasswordHasher;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    passwordHasher = new FakePasswordHasher();
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('devrait inscrire un utilisateur avec succès quand le mot de passe respecte la politique CNIL', async () => {
    const result = await useCase.execute({
      email: 'karen@homeez.fr',
      password: 'StrongPassword123!',
      firstName: 'Karen',
      lastName: 'ESGI',
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe('karen@homeez.fr');
    expect(result.firstName).toBe('Karen');
    expect(result.lastName).toBe('ESGI');
    expect(result.role).toBe('member');
    expect(result.isVerified).toBe(false);

    // Vérifie que l'utilisateur est bien stocké avec un mot de passe haché
    const savedUser = await userRepository.findByEmail(new Email('karen@homeez.fr'));
    expect(savedUser).not.toBeNull();
    expect(savedUser?.passwordHash).toBe('hashed_StrongPassword123!');
  });

  it('devrait rejeter un mot de passe trop court (< 12 caractères)', async () => {
    await expect(
      useCase.execute({
        email: 'karen@homeez.fr',
        password: 'Short1!',
        firstName: 'Karen',
        lastName: 'ESGI',
      }),
    ).rejects.toThrow(WeakPasswordException);
  });

  it('devrait rejeter un mot de passe sans caractère spécial', async () => {
    await expect(
      useCase.execute({
        email: 'karen@homeez.fr',
        password: 'PasswordSansSpecial123',
        firstName: 'Karen',
        lastName: 'ESGI',
      }),
    ).rejects.toThrow(WeakPasswordException);
  });

  it('devrait rejeter un mot de passe sans chiffre', async () => {
    await expect(
      useCase.execute({
        email: 'karen@homeez.fr',
        password: 'PasswordSansChiffre!',
        firstName: 'Karen',
        lastName: 'ESGI',
      }),
    ).rejects.toThrow(WeakPasswordException);
  });

  it('devrait rejeter une tentative avec un email déjà existant', async () => {
    await useCase.execute({
      email: 'existant@homeez.fr',
      password: 'StrongPassword123!',
      firstName: 'Karen',
      lastName: 'ESGI',
    });

    await expect(
      useCase.execute({
        email: 'EXISTANT@homeez.fr',
        password: 'AnotherPassword123!',
        firstName: 'Autre',
        lastName: 'Personne',
      }),
    ).rejects.toThrow(UserAlreadyExistsException);
  });

  it('devrait rejeter un format d email invalide', async () => {
    await expect(
      useCase.execute({
        email: 'invalid-email-format',
        password: 'StrongPassword123!',
        firstName: 'Karen',
        lastName: 'ESGI',
      }),
    ).rejects.toThrow(InvalidEmailException);
  });
});
