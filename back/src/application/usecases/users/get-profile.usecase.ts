import { UserRepositoryInterface } from '../../repositories/user.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { toUserProfile, UserProfile } from './user-profile';

export class GetProfileUsecase {
  constructor(private readonly users: UserRepositoryInterface) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return toUserProfile(user);
  }
}
