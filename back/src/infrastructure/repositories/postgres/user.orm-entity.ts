import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { USER_ROLES, UserRole } from '../../../domain/entities/user.entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) email: string;
  @Column({ name: 'password_hash' }) passwordHash: string;
  @Column({ type: 'enum', enum: USER_ROLES, default: 'member' })
  role: UserRole;
  @Column({ name: 'household_id', type: 'uuid', nullable: true })
  householdId: string | null;
  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;
  @Column({ name: 'password_changed_at', type: 'timestamptz' })
  passwordChangedAt: Date;
  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;
  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
