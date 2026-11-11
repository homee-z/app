import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email | string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete?(id: string): Promise<void>;
}

export type UserRepositoryInterface = IUserRepository;
