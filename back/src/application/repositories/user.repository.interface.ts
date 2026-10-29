import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
