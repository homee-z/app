import { Email } from '../../domain/value-objects/email.value-object';
import { IUserRepository } from '../repositories/user.repository.interface';
import {
  AccountLockedException,
  UserNotFoundException,
} from '../exceptions/auth.exceptions';

export interface VerifyMagicLinkCommand {
  email: string;
}

export interface VerifyMagicLinkResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export class VerifyMagicLinkUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(
    command: VerifyMagicLinkCommand,
  ): Promise<VerifyMagicLinkResult> {
    const email = new Email(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundException(command.email);
    }

    if (user.isLocked()) {
      throw new AccountLockedException(15);
    }

    user.recordSuccessfulLogin();
    await this.userRepository.update(user);

    return {
      userId: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
