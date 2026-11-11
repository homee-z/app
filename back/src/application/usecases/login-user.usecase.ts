import { Email } from '../../domain/value-objects/email.value-object';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IPasswordHasher } from '../services/password-hasher.interface';
import {
  AccountLockedException,
  InvalidCredentialsException,
} from '../exceptions/auth.exceptions';

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface LoginUserResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  requiresTwoFactor: boolean;
  isPasswordExpired: boolean;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  public async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    let email: Email;
    try {
      email = new Email(command.email);
    } catch {
      throw new InvalidCredentialsException();
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await this.passwordHasher.compare(
        command.password,
        '$2b$12$e80yq9w.Jsm45oIeF980e.fakeDummyHashForTimingAttackProtection',
      );
      throw new InvalidCredentialsException();
    }

    if (user.isLocked()) {
      const minutesRemaining = Math.ceil(
        (user.lockUntil!.getTime() - Date.now()) / (60 * 1000),
      );
      throw new AccountLockedException(minutesRemaining > 0 ? minutesRemaining : 1);
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      user.recordFailedLogin();
      await this.userRepository.update(user);
      throw new InvalidCredentialsException();
    }

    user.recordSuccessfulLogin();
    await this.userRepository.update(user);

    return {
      userId: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      requiresTwoFactor: user.twoFactorEnabled,
      isPasswordExpired: user.isPasswordExpired(60),
    };
  }
}
