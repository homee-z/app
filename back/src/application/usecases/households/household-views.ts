import { Household } from '../../../domain/entities/household.entity';
import {
  HouseholdMember,
  HouseholdMemberStatus,
  HouseholdRole,
} from '../../../domain/entities/household-member.entity';
import { User } from '../../../domain/entities/user.entity';

export interface HouseholdView {
  id: string;
  name: string;
  role: HouseholdRole;
  status: HouseholdMemberStatus;
  memberCount: number;
  // Foyer à ouvrir à la connexion (un seul par utilisateur, parmi ses foyers actifs).
  isDefault: boolean;
  // Seulement pour un admin actif : le code permet de rejoindre le foyer.
  code?: string;
  createdAt: Date;
}

export interface HouseholdMemberView {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: HouseholdRole;
  status: HouseholdMemberStatus;
  joinedAt: Date;
}

export const toHouseholdView = (
  household: Household,
  membership: HouseholdMember,
  memberCount: number,
): HouseholdView => ({
  id: household.id,
  name: household.name,
  role: membership.role,
  status: membership.status,
  memberCount,
  isDefault: membership.isDefault,
  ...(membership.isAdmin() ? { code: household.code.value } : {}),
  createdAt: household.createdAt,
});

export const toHouseholdMemberView = (
  member: HouseholdMember,
  user: User | null,
): HouseholdMemberView => ({
  userId: member.userId,
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  avatarUrl: user?.avatarUrl ?? null,
  role: member.role,
  status: member.status,
  joinedAt: member.createdAt,
});
