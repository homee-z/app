import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetEntryEntity } from '../../../domain/entities/budget-entry.entity';
import { BudgetEntryRepositoryInterface } from '../../../application/repositories/budget-entry.repository.interface';
import { BudgetEntryOrmEntity } from './budget-entry.orm-entity';

@Injectable()
export class BudgetEntryPostgresRepository
  implements BudgetEntryRepositoryInterface
{
  constructor(
    @InjectRepository(BudgetEntryOrmEntity)
    private readonly repo: Repository<BudgetEntryOrmEntity>,
  ) {}

  public async save(entry: BudgetEntryEntity): Promise<void> {
    await this.repo.save(this.toOrm(entry));
  }

  public async findById(id: string): Promise<BudgetEntryEntity | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  public async findByHousehold(
    householdId: string,
  ): Promise<BudgetEntryEntity[]> {
    const orms = await this.repo.find({
      where: { householdId },
      order: { date: 'DESC' },
    });

    return orms.map((orm) => this.toDomain(orm));
  }

  public async update(entry: BudgetEntryEntity): Promise<void> {
    await this.repo.save(this.toOrm(entry));
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(orm: BudgetEntryOrmEntity): BudgetEntryEntity {
    return new BudgetEntryEntity({
      id: orm.id,
      householdId: orm.householdId,
      createdById: orm.createdById,
      label: orm.label,
      amount: orm.amount,
      category: orm.category,
      date: orm.date,
      createdAt: orm.createdAt,
    });
  }

  private toOrm(entry: BudgetEntryEntity): BudgetEntryOrmEntity {
    const orm = new BudgetEntryOrmEntity();
    orm.id = entry.id;
    orm.householdId = entry.householdId;
    orm.createdById = entry.createdById;
    orm.label = entry.label;
    orm.amount = entry.amount;
    orm.category = entry.category;
    orm.date = entry.date;
    return orm;
  }
}