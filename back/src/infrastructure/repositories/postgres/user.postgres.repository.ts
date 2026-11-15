import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { IUserRepository } from '../../../application/repositories/user.repository.interface';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserPostgresRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  public async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  public async findByEmail(email: Email | string): Promise<User | null> {
    const rawEmail = typeof email === 'string' ? email : email.value;
    const orm = await this.repo.findOneBy({ email: rawEmail.toLowerCase().trim() });
    return orm ? this.toDomain(orm) : null;
  }

  public async save(user: User): Promise<void> {
    await this.repo.save(this.toOrm(user));
  }

  public async update(user: User): Promise<void> {
    await this.repo.save(this.toOrm(user));
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      email: new Email(orm.email),
      passwordHash: orm.passwordHash,
      firstName: orm.firstName || (orm.name ? orm.name.split(' ')[0] : ''),
      lastName:
        orm.lastName ||
        (orm.name ? orm.name.split(' ').slice(1).join(' ') : ''),
      avatarUrl: orm.avatarUrl,
      role: orm.role,
      householdId: orm.householdId,
      isVerified: orm.isVerified ?? false,
      verificationToken: orm.verificationToken ?? null,
      twoFactorEnabled: orm.twoFactorEnabled ?? false,
      twoFactorSecret: orm.twoFactorSecret ?? null,
      passwordChangedAt: orm.passwordChangedAt ?? new Date(),
      failedLoginAttempts: orm.failedLoginAttempts ?? 0,
      lockedUntil: orm.lockedUntil ?? null,
      createdAt: orm.createdAt ?? new Date(),
      updatedAt: orm.updatedAt ?? new Date(),
    });
  }

  private toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id;
    orm.firstName = user.firstName;
    orm.lastName = user.lastName;
    orm.name = user.name;
    orm.email = user.email.value;
    orm.passwordHash = user.passwordHash;
    orm.role = user.role;
    orm.householdId = user.householdId;
    orm.avatarUrl = user.avatarUrl;
    orm.isVerified = user.isVerified;
    orm.verificationToken = user.verificationToken;
    orm.twoFactorEnabled = user.twoFactorEnabled;
    orm.twoFactorSecret = user.twoFactorSecret;
    orm.passwordChangedAt = user.passwordChangedAt;
    orm.failedLoginAttempts = user.failedLoginAttempts;
    orm.lockedUntil = user.lockedUntil;
    return orm;
  }
}
