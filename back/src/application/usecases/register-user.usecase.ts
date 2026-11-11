import { randomUUID } from 'crypto';
import { User, UserRole } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { IUserRepository } from '../repositories/user.repository.interface';
import { IPasswordHasher } from '../services/password-hasher.interface';
import {
  UserAlreadyExistsException,
  WeakPasswordException,
} from '../exceptions/auth.exceptions';

export interface RegisterUserCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RegisterUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  public async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = new Email(command.email);

    this.validatePasswordPolicy(command.password);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email.getValue());
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const verificationToken = randomUUID();

    const user = new User({
      id: randomUUID(),
      email,
      passwordHash,
      firstName: command.firstName.trim(),
      lastName: command.lastName.trim(),
      role: command.role ?? 'member',
      isVerified: false,
      verificationToken,
      twoFactorEnabled: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  private validatePasswordPolicy(password: string): void {
    if (!password || password.length < 12) {
      throw new WeakPasswordException(
        'Le mot de passe doit comporter au minimum 12 caractères.',
      );
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      throw new WeakPasswordException();
    }
  }
}
