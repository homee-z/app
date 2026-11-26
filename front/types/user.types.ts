import { HouseholdRole } from "./household-types";

export type User = { 
    id : string,
    firstName : string,
}

export type LoginResult = {
    message: string;
    user: {
        id: string;
        firstName: string;
        email: string;
        role: HouseholdRole;
        householdId: string | null;
    };
};

export type RegisterResult = {
    message: string;
    user: {
        id: string,
        email: string,
        firstName: string,
        lastName: string,
        role: HouseholdRole,
        isVerified: boolean,
    };
};

export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    role: 'admin' | 'member' | 'guest';
    householdId: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
    createdAt: string;
};

export type UpdateProfileInput = {
    firstName?: string;
    lastName?: string;
    email?: string;
};