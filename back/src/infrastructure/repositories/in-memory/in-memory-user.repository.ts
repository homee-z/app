import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../application/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';

@Injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  public async findByEmail(email: Email): Promise<User | null> {
    const user = this.users.find((u) => u.email.equals(email));
    return user ?? null;
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ?? null;
  }

  public async save(user: User): Promise<void> {
    this.users.push(user);
  }

  public async update(user: User): Promise<void> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  public clear(): void {
    this.users = [];
  }
}
