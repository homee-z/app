import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Household } from '../../../domain/entities/household.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { HouseholdCode } from '../../../domain/value-objects/household-code.value-object';
import { IHouseholdRepository } from '../../../application/repositories/household.repository.interface';
import { HouseholdOrmEntity } from './household.orm-entity';
import { HouseholdMemberOrmEntity } from './household-member.orm-entity';
import { HouseholdMemberPostgresRepository } from './household-member.postgres.repository';

@Injectable()
export class HouseholdPostgresRepository implements IHouseholdRepository {
  constructor(
    @InjectRepository(HouseholdOrmEntity)
    private readonly repo: Repository<HouseholdOrmEntity>,
  ) {}

  public async findById(id: string): Promise<Household | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  public async findByCode(
    code: HouseholdCode | string,
  ): Promise<Household | null> {
    const value =
      typeof code === 'string' ? new HouseholdCode(code).value : code.value;
    const orm = await this.repo.findOneBy({ code: value });
    return orm ? this.toDomain(orm) : null;
  }

  public async findByIds(ids: string[]): Promise<Household[]> {
    if (ids.length === 0) return [];
    const orms = await this.repo.findBy({ id: In(ids) });
    return orms.map((orm) => this.toDomain(orm));
  }

  public async save(household: Household): Promise<void> {
    await this.repo.save(this.toOrm(household));
  }

  public async createWithAdmin(
    household: Household,
    admin: HouseholdMember,
  ): Promise<void> {
    await this.repo.manager.transaction(async (em) => {
      await em.save(HouseholdOrmEntity, this.toOrm(household));
      await em.save(
        HouseholdMemberOrmEntity,
        HouseholdMemberPostgresRepository.toOrm(admin),
      );
    });
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(orm: HouseholdOrmEntity): Household {
    return new Household({
      id: orm.id,
      name: orm.name,
      code: new HouseholdCode(orm.code),
      createdAt: orm.createdAt,
    });
  }

  private toOrm(household: Household): HouseholdOrmEntity {
    const orm = new HouseholdOrmEntity();
    orm.id = household.id;
    orm.name = household.name;
    orm.code = household.code.value;
    orm.createdAt = household.createdAt;
    return orm;
  }
}
