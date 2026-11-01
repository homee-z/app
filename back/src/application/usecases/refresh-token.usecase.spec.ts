import { RefreshTokenUseCase } from './refresh-token.usecase';
import { IUserRepository } from '../repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import {
  AccountLockedException,
  UserNotFoundException,
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    useCase = new RefreshTokenUseCase(userRepository);
  });

  it('devrait rafraîchir la session d un utilisateur existant', async () => {
    const user = new User({
      id: 'usr-123',
      email: new Email('karen@homeez.fr'),
      passwordHash: 'hashed_password',
      firstName: 'Karen',
      lastName: 'ESGI',
      role: 'admin',
      isVerified: true,
      twoFactorEnabled: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
    });
    await userRepository.save(user);

    const result = await useCase.execute({ userId: 'usr-123' });

    expect(result.userId).toBe('usr-123');
    expect(result.email).toBe('karen@homeez.fr');
    expect(result.firstName).toBe('Karen');
    expect(result.role).toBe('admin');
  });

  it('devrait lever UserNotFoundException si l utilisateur n existe pas', async () => {
    await expect(
      useCase.execute({ userId: 'inexistant-id' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('devrait bloquer le rafraîchissement si le compte est verrouillé', async () => {
    const lockedUser = new User({
      id: 'usr-locked',
      email: new Email('locked@homeez.fr'),
      passwordHash: 'hashed_password',
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
      useCase.execute({ userId: 'usr-locked' }),
    ).rejects.toThrow(AccountLockedException);
  });
});
