import { Email } from '../value-objects/email.value-object';

export type UserRole = 'admin' | 'member' | 'guest';

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  passwordChangedAt: Date;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = {
      ...props,
      avatarUrl: props.avatarUrl ?? null,
      verificationToken: props.verificationToken ?? null,
      twoFactorSecret: props.twoFactorSecret ?? null,
      lockUntil: props.lockUntil ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get id(): string { return this.props.id; }
  public get email(): Email { return this.props.email; }
  public get passwordHash(): string { return this.props.passwordHash; }
  public get firstName(): string { return this.props.firstName; }
  public get lastName(): string { return this.props.lastName; }
  public get avatarUrl(): string | null { return this.props.avatarUrl ?? null; }
  public get role(): UserRole { return this.props.role; }
  public get isVerified(): boolean { return this.props.isVerified; }
  public get verificationToken(): string | null { return this.props.verificationToken ?? null; }
  public get twoFactorEnabled(): boolean { return this.props.twoFactorEnabled; }
  public get twoFactorSecret(): string | null { return this.props.twoFactorSecret ?? null; }
  public get passwordChangedAt(): Date { return this.props.passwordChangedAt; }
  public get failedLoginAttempts(): number { return this.props.failedLoginAttempts; }
  public get lockUntil(): Date | null { return this.props.lockUntil ?? null; }
  public get createdAt(): Date { return this.props.createdAt!; }
  public get updatedAt(): Date { return this.props.updatedAt!; }

  public recordFailedLogin(lockoutDurationMinutes = 15, maxAttempts = 5): void {
    this.props.failedLoginAttempts += 1;
    if (this.props.failedLoginAttempts >= maxAttempts) {
      const now = new Date();
      this.props.lockUntil = new Date(now.getTime() + lockoutDurationMinutes * 60 * 1000);
    }
    this.props.updatedAt = new Date();
  }

  public recordSuccessfulLogin(): void {
    this.props.failedLoginAttempts = 0;
    this.props.lockUntil = null;
    this.props.updatedAt = new Date();
  }

  public isLocked(): boolean {
    if (!this.props.lockUntil) return false;
    return this.props.lockUntil.getTime() > Date.now();
  }

  public isPasswordExpired(maxDays = 60): boolean { //reco CNIL
    const maxAgeMs = maxDays * 24 * 60 * 60 * 1000;
    const ageMs = Date.now() - this.props.passwordChangedAt.getTime();
    return ageMs > maxAgeMs;
  }

  public updatePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.passwordChangedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public verifyEmail(): void {
    this.props.isVerified = true;
    this.props.verificationToken = null;
    this.props.updatedAt = new Date();
  }

  public enableTwoFactor(secret: string): void {
    this.props.twoFactorEnabled = true;
    this.props.twoFactorSecret = secret;
    this.props.updatedAt = new Date();
  }

  public disableTwoFactor(): void {
    this.props.twoFactorEnabled = false;
    this.props.twoFactorSecret = null;
    this.props.updatedAt = new Date();
  }
}
