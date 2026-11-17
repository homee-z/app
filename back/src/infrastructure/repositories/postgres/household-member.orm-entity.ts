import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import {
  HOUSEHOLD_MEMBER_STATUSES,
  HOUSEHOLD_ROLES,
  type HouseholdMemberStatus,
  type HouseholdRole,
} from '../../../domain/entities/household-member.entity';
import { HouseholdOrmEntity } from './household.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Entity('household_members')
@Unique('UQ_household_members_user_household', ['userId', 'householdId'])
export class HouseholdMemberOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({ name: 'household_id', type: 'uuid' })
  householdId: string;

  @Column({ type: 'enum', enum: HOUSEHOLD_ROLES, enumName: 'household_role' })
  role: HouseholdRole;

  @Column({
    type: 'enum',
    enum: HOUSEHOLD_MEMBER_STATUSES,
    enumName: 'household_member_status',
  })
  status: HouseholdMemberStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  // Clés étrangères : supprimer un utilisateur ou un foyer supprime ses adhésions.
  // TODO: empêcher la suppression du compte du seul admin d'un foyer qui a d'autres membres actifs (409).
  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserOrmEntity;

  @ManyToOne(() => HouseholdOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'household_id' })
  household?: HouseholdOrmEntity;
}
