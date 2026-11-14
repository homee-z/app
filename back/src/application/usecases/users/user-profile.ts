import { User, UserRole } from '../../../domain/entities/user.entity';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  householdId: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
}

export const toUserProfile = (user: User): UserProfile => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  email: user.email.value,
  role: user.role,
  householdId: user.householdId,
  avatarUrl: user.avatarUrl,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});
