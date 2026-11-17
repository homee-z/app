import { DomainError } from '../errors/domain.error';

export const HOUSEHOLD_ROLES = ['admin', 'member', 'guest'] as const;
export type HouseholdRole = (typeof HOUSEHOLD_ROLES)[number];

export const HOUSEHOLD_MEMBER_STATUSES = ['pending', 'active'] as const;
export type HouseholdMemberStatus = (typeof HOUSEHOLD_MEMBER_STATUSES)[number];

export interface HouseholdMemberProps {
  id: string;
  userId: string;
  householdId: string;
  role: HouseholdRole;
  status: HouseholdMemberStatus;
  createdAt?: Date;
}

// Lien entre un utilisateur et un foyer : un utilisateur peut avoir plusieurs foyers,
// avec un rôle différent dans chacun.
export class HouseholdMember {
  public readonly id: string;
  public readonly userId: string;
  public readonly householdId: string;
  public role: HouseholdRole;
  public status: HouseholdMemberStatus;
  public readonly createdAt: Date;

  constructor(props: HouseholdMemberProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.householdId = props.householdId;
    this.role = props.role;
    this.status = props.status;
    this.createdAt = props.createdAt ?? new Date();
  }

  static createAdmin(
    id: string,
    userId: string,
    householdId: string,
  ): HouseholdMember {
    return new HouseholdMember({
      id,
      userId,
      householdId,
      role: 'admin',
      status: 'active',
    });
  }

  static requestToJoin(
    id: string,
    userId: string,
    householdId: string,
  ): HouseholdMember {
    return new HouseholdMember({
      id,
      userId,
      householdId,
      role: 'member',
      status: 'pending',
    });
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isPending(): boolean {
    return this.status === 'pending';
  }

  isAdmin(): boolean {
    return this.isActive() && this.role === 'admin';
  }

  approve(): void {
    if (this.isActive()) {
      throw new DomainError('Cette adhésion est déjà active.');
    }
    this.status = 'active';
  }

  changeRole(role: HouseholdRole): void {
    if (!this.isActive()) {
      throw new DomainError("Cette adhésion n'est pas active.");
    }
    this.role = role;
  }
}
