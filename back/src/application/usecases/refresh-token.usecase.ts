import { IUserRepository } from '../repositories/user.repository.interface';
import {
  AccountLockedException,
  UserNotFoundException,
} from '../exceptions/auth.exceptions';

export interface RefreshTokenCommand {
  userId: string;
}

export interface RefreshTokenResult {
  userId: string;
  email: string;
  firstName: string;
  role: string;
}

export class RefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    if (user.isLocked()) {
      throw new AccountLockedException(15);
    }

    return {
      userId: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      role: user.role,
    };
  }
}
