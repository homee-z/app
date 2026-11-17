import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingItemEntity } from '../../../domain/entities/shopping-item.entity';
import { ShoppingItemRepositoryInterface } from '../../../application/repositories/shopping-item.repository.interface';
import { ShoppingItemOrmEntity } from './shopping-item.orm-entity';

@Injectable()
export class ShoppingItemPostgresRepository
  implements ShoppingItemRepositoryInterface
{
  constructor(
    @InjectRepository(ShoppingItemOrmEntity)
    private readonly repo: Repository<ShoppingItemOrmEntity>,
  ) {}

  public async findById(id: string): Promise<ShoppingItemEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.toDomain(orm) : null;
  }

  public async findAllByList(
    shoppingListId: string,
  ): Promise<ShoppingItemEntity[]> {
    const orms = await this.repo.find({ where: { shoppingListId } });
    return orms.map((orm) => this.toDomain(orm));
  }

  public async save(shoppingItem: ShoppingItemEntity): Promise<void> {
    await this.repo.save(this.toOrm(shoppingItem));
  }

  public async update(shoppingItem: ShoppingItemEntity): Promise<void> {
    await this.repo.save(this.toOrm(shoppingItem));
  }

  public async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(orm: ShoppingItemOrmEntity): ShoppingItemEntity {
    return new ShoppingItemEntity({
      id: orm.id,
      shoppingListId: orm.shoppingListId,
      name: orm.name,
      quantity: orm.quantity,
      isChecked: orm.isChecked,
      recipeIngredientId: orm.recipeIngredientId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  private toOrm(shoppingItem: ShoppingItemEntity): ShoppingItemOrmEntity {
    const orm = new ShoppingItemOrmEntity();
    orm.id = shoppingItem.id;
    orm.shoppingListId = shoppingItem.shoppingListId;
    orm.name = shoppingItem.name;
    orm.quantity = shoppingItem.quantity;
    orm.isChecked = shoppingItem.isChecked;
    orm.recipeIngredientId = shoppingItem.recipeIngredientId;
    return orm;
  }
}