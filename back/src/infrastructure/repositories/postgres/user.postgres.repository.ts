import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { UserRepositoryInterface } from '../../../application/repositories/user.repository.interface';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserPostgresRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string) {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmail(email: string) {
    const orm = await this.repo.findOneBy({ email: email.toLowerCase() });
    return orm ? this.toDomain(orm) : null;
  }

  async save(user: User) {
    await this.repo.save(this.toOrm(user));
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  private toDomain(orm: UserOrmEntity): User {
    return new User(
      orm.id,
      orm.name,
      new Email(orm.email),
      orm.passwordHash,
      orm.role,
      orm.householdId,
      orm.avatarUrl,
      orm.passwordChangedAt,
      orm.failedLoginAttempts,
      orm.lockedUntil,
      orm.createdAt,
    );
  }

  private toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id;
    orm.name = user.name;
    orm.email = user.email.value;
    orm.passwordHash = user.passwordHash;
    orm.role = user.role;
    orm.householdId = user.householdId;
    orm.avatarUrl = user.avatarUrl;
    orm.passwordChangedAt = user.passwordChangedAt;
    orm.failedLoginAttempts = user.failedLoginAttempts;
    orm.lockedUntil = user.lockedUntil;
    orm.createdAt = user.createdAt;
    return orm;
  }
}
