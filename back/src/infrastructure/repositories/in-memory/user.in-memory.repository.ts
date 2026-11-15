import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { UserRepositoryInterface } from '../../../application/repositories/user.repository.interface';

// Copie défensive : comme avec Postgres, modifier un User sans save/update ne change pas le stock.
const clone = (u: User): User =>
  new User({
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    householdId: u.householdId,
    avatarUrl: u.avatarUrl,
    isVerified: u.isVerified,
    verificationToken: u.verificationToken,
    twoFactorEnabled: u.twoFactorEnabled,
    twoFactorSecret: u.twoFactorSecret,
    passwordChangedAt: new Date(u.passwordChangedAt),
    failedLoginAttempts: u.failedLoginAttempts,
    lockedUntil: u.lockedUntil ? new Date(u.lockedUntil) : null,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  });

export class UserInMemoryRepository implements UserRepositoryInterface {
  private users: User[] = [];

  async findById(id: string) {
    const found = this.users.find((u) => u.id === id);
    return found ? clone(found) : null;
  }

  async findByEmail(email: Email | string) {
    const value =
      typeof email === 'string' ? email.trim().toLowerCase() : email.value;
    const found = this.users.find((u) => u.email.value === value);
    return found ? clone(found) : null;
  }

  async save(user: User) {
    const copy = clone(user);
    const index = this.users.findIndex((u) => u.id === copy.id);
    if (index >= 0) this.users[index] = copy;
    else this.users.push(copy);
  }

  async update(user: User) {
    await this.save(user);
  }

  async delete(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
  }
}
