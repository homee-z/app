import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shopping_items')
export class ShoppingItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'shopping_list_id', type: 'uuid' })
  shoppingListId: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  quantity: string | null;

  @Column({ name: 'is_checked', default: false })
  isChecked: boolean;

  @Column({ name: 'recipe_ingredient_id', type: 'uuid', nullable: true })
  recipeIngredientId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}