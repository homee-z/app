import { Email } from '../value-objects/email.value-object';

export const USER_ROLES = ['admin', 'member', 'guest'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: UserRole;
  householdId?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  verificationToken?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  passwordChangedAt?: Date;
  failedLoginAttempts?: number;
  lockUntil?: Date | null;
  lockedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public email: Email;
  public passwordHash: string;
  public firstName: string;
  public lastName: string;
  public role: UserRole;
  public householdId: string | null;
  public avatarUrl: string | null;
  public isVerified: boolean;
  public verificationToken: string | null;
  public twoFactorEnabled: boolean;
  public twoFactorSecret: string | null;
  public passwordChangedAt: Date;
  public failedLoginAttempts: number;
  public lockedUntil: Date | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    propsOrId: UserProps | string,
    name?: string,
    email?: Email,
    passwordHash?: string,
    role?: UserRole,
    householdId: string | null = null,
    avatarUrl: string | null = null,
    passwordChangedAt: Date = new Date(),
    failedLoginAttempts: number = 0,
    lockedUntil: Date | null = null,
    createdAt: Date = new Date(),
  ) {
    if (typeof propsOrId === 'string') {
      this.id = propsOrId;
      this.email = email!;
      this.passwordHash = passwordHash!;
      this.role = role ?? 'member';
      this.householdId = householdId;
      this.avatarUrl = avatarUrl;
      this.passwordChangedAt = passwordChangedAt;
      this.failedLoginAttempts = failedLoginAttempts;
      this.lockedUntil = lockedUntil;
      this.createdAt = createdAt;
      this.updatedAt = new Date();

      const nameParts = (name ?? '').trim().split(' ');
      this.firstName = nameParts[0] || '';
      this.lastName = nameParts.slice(1).join(' ') || '';
      this.isVerified = false;
      this.verificationToken = null;
      this.twoFactorEnabled = false;
      this.twoFactorSecret = null;
    } else {
      const props = propsOrId;
      this.id = props.id;
      this.email = props.email;
      this.passwordHash = props.passwordHash;
      this.firstName =
        props.firstName ?? (props.name ? props.name.split(' ')[0] : '');
      this.lastName =
        props.lastName ??
        (props.name ? props.name.split(' ').slice(1).join(' ') : '');
      this.role = props.role ?? 'member';
      this.householdId = props.householdId ?? null;
      this.avatarUrl = props.avatarUrl ?? null;
      this.isVerified = props.isVerified ?? false;
      this.verificationToken = props.verificationToken ?? null;
      this.twoFactorEnabled = props.twoFactorEnabled ?? false;
      this.twoFactorSecret = props.twoFactorSecret ?? null;
      this.passwordChangedAt = props.passwordChangedAt ?? new Date();
      this.failedLoginAttempts = props.failedLoginAttempts ?? 0;
      this.lockedUntil = props.lockedUntil ?? props.lockUntil ?? null;
      this.createdAt = props.createdAt ?? new Date();
      this.updatedAt = props.updatedAt ?? new Date();
    }
  }

  public get name(): string {
    return `${this.firstName} ${this.lastName}`.trim() || this.firstName;
  }

  public get lockUntil(): Date | null {
    return this.lockedUntil;
  }

  public set lockUntil(date: Date | null) {
    this.lockedUntil = date;
  }

  public recordFailedLogin(lockoutDurationMinutes = 15, maxAttempts = 5): void {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= maxAttempts) {
      const now = new Date();
      this.lockedUntil = new Date(
        now.getTime() + lockoutDurationMinutes * 60 * 1000,
      );
    }
    this.updatedAt = new Date();
  }

  public recordSuccessfulLogin(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    this.updatedAt = new Date();
  }

  public isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return this.lockedUntil.getTime() > Date.now();
  }

  public isPasswordExpired(maxDays = 60): boolean {
    const maxAgeMs = maxDays * 24 * 60 * 60 * 1000;
    const ageMs = Date.now() - this.passwordChangedAt.getTime();
    return ageMs > maxAgeMs;
  }

  public updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.passwordChangedAt = new Date();
    this.updatedAt = new Date();
  }

  public verifyEmail(): void {
    this.isVerified = true;
    this.verificationToken = null;
    this.updatedAt = new Date();
  }

  public enableTwoFactor(secret: string): void {
    this.twoFactorEnabled = true;
    this.twoFactorSecret = secret;
    this.updatedAt = new Date();
  }

  public disableTwoFactor(): void {
    this.twoFactorEnabled = false;
    this.twoFactorSecret = null;
    this.updatedAt = new Date();
  }
}
