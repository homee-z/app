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

