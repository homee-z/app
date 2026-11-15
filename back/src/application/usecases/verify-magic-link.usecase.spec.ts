import { VerifyMagicLinkUseCase } from './verify-magic-link.usecase';
import { IUserRepository } from '../repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import {
  AccountLockedException,
  UserNotFoundException,
} from '../exceptions/auth.exceptions';

class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((u) => u.email.equals(email)) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
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

describe('VerifyMagicLinkUseCase', () => {
  let useCase: VerifyMagicLinkUseCase;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new VerifyMagicLinkUseCase(userRepository);
  });

  it('devrait valider le lien magique et réinitialiser les échecs de connexion', async () => {
    const user = new User({
      id: 'usr-1',
      email: new Email('karen@homeez.fr'),
      passwordHash: 'hashed_pwd',
      firstName: 'Karen',
      lastName: 'ESGI',
      role: 'member',
      isVerified: true,
      twoFactorEnabled: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 3,
    });
    await userRepository.save(user);

    const result = await useCase.execute({ email: 'karen@homeez.fr' });

    expect(result.userId).toBe('usr-1');
    expect(result.email).toBe('karen@homeez.fr');
    expect(result.firstName).toBe('Karen');
    expect(user.failedLoginAttempts).toBe(0);
  });

  it('devrait lever UserNotFoundException si l utilisateur n existe pas', async () => {
    await expect(
      useCase.execute({ email: 'inconnu@homeez.fr' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('devrait bloquer la connexion si le compte est verrouillé', async () => {
    const lockedUser = new User({
      id: 'usr-locked',
      email: new Email('locked@homeez.fr'),
      passwordHash: 'hashed_pwd',
      firstName: 'Karen',
      lastName: 'ESGI',
      role: 'member',
      isVerified: true,
      twoFactorEnabled: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 5,
      lockUntil: new Date(Date.now() + 15 * 60 * 1000),
    });
    await userRepository.save(lockedUser);

    await expect(
      useCase.execute({ email: 'locked@homeez.fr' }),
    ).rejects.toThrow(AccountLockedException);
  });
});

