import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('budget_entries')
@Index(['householdId', 'date'])
export class BudgetEntryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'household_id', type: 'uuid' })
  householdId: string;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @Column({ type: 'varchar', length: 200 })
  label: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'timestamptz' })
  date: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}