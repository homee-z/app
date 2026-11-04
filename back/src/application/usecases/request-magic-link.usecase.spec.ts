import { RequestMagicLinkUseCase } from './request-magic-link.usecase';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IMailSender, SendMailOptions } from '../services/mail-sender.interface';
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

class FakeMailSender implements IMailSender {
  public sentMails: SendMailOptions[] = [];

  async sendMail(options: SendMailOptions): Promise<void> {
    this.sentMails.push(options);
  }
}

describe('RequestMagicLinkUseCase', () => {
  let useCase: RequestMagicLinkUseCase;
  let userRepository: InMemoryUserRepository;
  let mailSender: FakeMailSender;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    mailSender = new FakeMailSender();
    useCase = new RequestMagicLinkUseCase(userRepository, mailSender);
  });

  it('devrait envoyer un email contenant le lien magique à un utilisateur existant', async () => {
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
      failedLoginAttempts: 0,
    });
    await userRepository.save(user);

    const result = await useCase.execute({
      email: 'karen@homeez.fr',
      magicLinkUrl: 'http://localhost:3000/auth/verify?token=fake_token',
    });

    expect(result.userId).toBe('usr-1');
    expect(result.email).toBe('karen@homeez.fr');
    expect(mailSender.sentMails).toHaveLength(1);
    expect(mailSender.sentMails[0].to).toBe('karen@homeez.fr');
    expect(mailSender.sentMails[0].html).toContain('http://localhost:3000/auth/verify?token=fake_token');
  });

  it('devrait lever UserNotFoundException si l email n existe pas', async () => {
    await expect(
      useCase.execute({
        email: 'inconnu@homeez.fr',
        magicLinkUrl: 'http://localhost:3000/auth/verify?token=fake_token',
      }),
    ).rejects.toThrow(UserNotFoundException);

    expect(mailSender.sentMails).toHaveLength(0);
  });

  it('devrait bloquer la demande si le compte est verrouillé', async () => {
    const user = new User({
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
    await userRepository.save(user);

    await expect(
      useCase.execute({
        email: 'locked@homeez.fr',
        magicLinkUrl: 'http://localhost:3000/auth/verify?token=fake_token',
      }),
    ).rejects.toThrow(AccountLockedException);

    expect(mailSender.sentMails).toHaveLength(0);
  });
});

