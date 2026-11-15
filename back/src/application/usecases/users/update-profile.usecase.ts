import { UserRepositoryInterface } from '../../repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.value-object';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { toUserProfile, UserProfile } from './user-profile';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UpdateProfileUsecase {
  constructor(private readonly users: UserRepositoryInterface) {}

  async execute(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (input.firstName !== undefined) user.firstName = input.firstName;
    if (input.lastName !== undefined) user.lastName = input.lastName;

    if (input.email !== undefined) {
      const email = new Email(input.email);
      const existing = await this.users.findByEmail(email);
      if (existing && existing.id !== user.id) {
        throw new ConflictError('Email already used');
      }
      user.email = email;
    }

    user.updatedAt = new Date();
    await this.users.update(user);
    return toUserProfile(user);
  }
}
