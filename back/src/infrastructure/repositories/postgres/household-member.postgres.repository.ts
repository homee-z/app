import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { DefaultHouseholdRepositoryInterface } from '../../../application/repositories/household-member.repository.interface';
import { HouseholdMemberOrmEntity } from './household-member.orm-entity';

@Injectable()
export class HouseholdMemberPostgresRepository implements DefaultHouseholdRepositoryInterface {
  constructor(
    @InjectRepository(HouseholdMemberOrmEntity)
    private readonly repo: Repository<HouseholdMemberOrmEntity>,
  ) {}

  public async findOne(
    householdId: string,
    userId: string,
  ): Promise<HouseholdMember | null> {
    const orm = await this.repo.findOneBy({ householdId, userId });
    return orm ? HouseholdMemberPostgresRepository.toDomain(orm) : null;
  }

  public async findByUser(userId: string): Promise<HouseholdMember[]> {
    const orms = await this.repo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => HouseholdMemberPostgresRepository.toDomain(orm));
  }

  public async findByHousehold(
    householdId: string,
  ): Promise<HouseholdMember[]> {
    const orms = await this.repo.find({
      where: { householdId },
      order: { createdAt: 'ASC' },
    });
    return orms.map((orm) => HouseholdMemberPostgresRepository.toDomain(orm));
  }

  public async countActiveAdmins(householdId: string): Promise<number> {
    return this.repo.countBy({ householdId, role: 'admin', status: 'active' });
  }

  public async save(member: HouseholdMember): Promise<void> {
    await this.repo.save(HouseholdMemberPostgresRepository.toOrm(member));
  }

  // On retire d'abord l'ancien flag : sinon l'index unique partiel refuse le nouveau.
  public async setDefault(userId: string, householdId: string): Promise<void> {
    await this.repo.manager.transaction(async (em) => {
      await em.update(
        HouseholdMemberOrmEntity,
        { userId, isDefault: true },
        { isDefault: false },
      );
      await em.update(
        HouseholdMemberOrmEntity,
        { userId, householdId },
        { isDefault: true },
      );
    });
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // Statiques : réutilisées par HouseholdPostgresRepository.createWithAdmin (transaction).
  static toDomain(orm: HouseholdMemberOrmEntity): HouseholdMember {
    return new HouseholdMember({
      id: orm.id,
      userId: orm.userId,
      householdId: orm.householdId,
      role: orm.role,
      status: orm.status,
      isDefault: orm.isDefault,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(member: HouseholdMember): HouseholdMemberOrmEntity {
    const orm = new HouseholdMemberOrmEntity();
    orm.id = member.id;
    orm.userId = member.userId;
    orm.householdId = member.householdId;
    orm.role = member.role;
    orm.status = member.status;
    orm.isDefault = member.isDefault;
    orm.createdAt = member.createdAt;
    return orm;
  }
}
