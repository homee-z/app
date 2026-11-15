import { UserRepositoryInterface } from '../../repositories/user.repository.interface';
import { NotFoundError } from '../../../domain/errors/not-found.error';

// `delete` est optionnel dans l'interface commune : ce usecase exige un repo qui l'implémente.
export type DeletableUserRepository = UserRepositoryInterface &
  Required<Pick<UserRepositoryInterface, 'delete'>>;

export class DeleteAccountUsecase {
  constructor(private readonly users: DeletableUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    await this.users.delete(userId);
  }
}
