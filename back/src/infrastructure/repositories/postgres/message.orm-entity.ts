import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('messages')
@Index(['householdId', 'createdAt'])
export class MessageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'household_id', type: 'uuid' })
  householdId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}