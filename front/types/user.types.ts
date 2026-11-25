export type User = { 
    id : string,
    role : UserRole,
    firstName : string,
    householdId : string | null
}

export enum UserRole {
    admin = 'admin',
    member = 'member',
    guest = 'guest'
}

export type LoginResult = {
    message: string;
    user: {
        id: string;
        firstName: string;
        email: string;
        role: UserRole;
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
        role: UserRole,
        isVerified: boolean,
    };
};
