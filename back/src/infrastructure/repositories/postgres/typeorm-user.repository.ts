import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../application/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.value-object';
import { UserTypeOrmEntity } from './entities/user.typeorm-entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly ormRepository: Repository<UserTypeOrmEntity>,
  ) {}

  public async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { email: email.getValue() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  public async findById(id: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  public async save(user: User): Promise<void> {
    const entity = this.toOrm(user);
    await this.ormRepository.save(entity);
  }

  public async update(user: User): Promise<void> {
    const entity = this.toOrm(user);
    await this.ormRepository.save(entity);
  }

  private toDomain(entity: UserTypeOrmEntity): User {
    return new User({
      id: entity.id,
      email: new Email(entity.email),
      passwordHash: entity.passwordHash,
      firstName: entity.firstName,
      lastName: entity.lastName,
      avatarUrl: entity.avatarUrl,
      role: entity.role,
      isVerified: entity.isVerified,
      verificationToken: entity.verificationToken,
      twoFactorEnabled: entity.twoFactorEnabled,
      twoFactorSecret: entity.twoFactorSecret,
      passwordChangedAt: entity.passwordChangedAt,
      failedLoginAttempts: entity.failedLoginAttempts,
      lockUntil: entity.lockUntil,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toOrm(user: User): UserTypeOrmEntity {
    const entity = new UserTypeOrmEntity();
    entity.id = user.id;
    entity.email = user.email.getValue();
    entity.passwordHash = user.passwordHash;
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.avatarUrl = user.avatarUrl;
    entity.role = user.role;
    entity.isVerified = user.isVerified;
    entity.verificationToken = user.verificationToken;
    entity.twoFactorEnabled = user.twoFactorEnabled;
    entity.twoFactorSecret = user.twoFactorSecret;
    entity.passwordChangedAt = user.passwordChangedAt;
    entity.failedLoginAttempts = user.failedLoginAttempts;
    entity.lockUntil = user.lockUntil;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }
}
