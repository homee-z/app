import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { HOUSEHOLD_NAME_MAX } from '../../../domain/entities/household.entity';

@Entity('households')
export class HouseholdOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: HOUSEHOLD_NAME_MAX })
  name: string;

  @Column({ type: 'varchar', length: 6, unique: true })
  code: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
