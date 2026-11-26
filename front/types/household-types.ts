export type HouseholdRole = 'admin' | 'member' | 'guest';
export type HouseholdMemberStatus = 'pending' | 'active';

export interface Household {
    id: string;
    name: string;
    role: HouseholdRole;
    status: HouseholdMemberStatus;
    memberCount: number; // membres actifs uniquement
    code?: string; // présent seulement pour un admin actif
    createdAt: string;
}

export interface HouseholdMember {
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role: HouseholdRole;
    status: HouseholdMemberStatus;
    joinedAt: string;
}