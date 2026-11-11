import { Email } from '../value-objects/email.value-object';

export const USER_ROLES = ['admin', 'member', 'guest'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: Email,
    public passwordHash: string,
    public role: UserRole,
    public householdId: string | null = null,
    public avatarUrl: string | null = null,
    public passwordChangedAt: Date = new Date(),
    public failedLoginAttempts: number = 0,
    public lockedUntil: Date | null = null,
    public readonly createdAt: Date = new Date(),
  ) {}
}
