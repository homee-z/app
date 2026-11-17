import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingListEntity } from '../../../domain/entities/shopping-list.entity';
import { ShoppingListRepositoryInterface } from '../../../application/repositories/shopping-list.repository.interface';
import { ShoppingListOrmEntity } from './shopping-list.orm-entity';

@Injectable()
export class ShoppingListPostgresRepository
  implements ShoppingListRepositoryInterface
{
  constructor(
    @InjectRepository(ShoppingListOrmEntity)
    private readonly repo: Repository<ShoppingListOrmEntity>,
  ) {}

  public async findById(id: string): Promise<ShoppingListEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  public async findAllByHousehold(
    householdId: string,
  ): Promise<ShoppingListEntity[]> {
    const orms = await this.repo.find({ where: { householdId } });
    return orms.map((orm) => this.toDomain(orm));
  }

  public async save(shoppingList: ShoppingListEntity): Promise<void> {
    await this.repo.save(this.toOrm(shoppingList));
  }

  public async update(shoppingList: ShoppingListEntity): Promise<void> {
    await this.repo.save(this.toOrm(shoppingList));
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(orm: ShoppingListOrmEntity): ShoppingListEntity {
    return new ShoppingListEntity({
      id: orm.id,
      householdId: orm.householdId,
      name: orm.name,
      choreId: orm.choreId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  private toOrm(shoppingList: ShoppingListEntity): ShoppingListOrmEntity {
    const orm = new ShoppingListOrmEntity();
    orm.id = shoppingList.id;
    orm.householdId = shoppingList.householdId;
    orm.name = shoppingList.name;
    orm.choreId = shoppingList.choreId;
    return orm;
  }
}