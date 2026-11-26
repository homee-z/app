import { DomainError } from '../errors/domain.error';

export const BUDGET_ENTRY_LABEL_MAX = 200;

export class InvalidBudgetEntryException extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBudgetEntryException';
  }
}

export interface BudgetEntryProps {
  id: string;
  householdId: string;
  createdById: string;
  label: string;
  amount: number;
  category?: string | null;
  date: Date;
  createdAt?: Date;
}

export interface UpdateBudgetEntryParams {
  label?: string;
  amount?: number;
  category?: string | null;
  date?: Date;
}

// Une ligne budgétaire peut être modifiée ou supprimée (contrairement au message, immuable).
export class BudgetEntryEntity {
  public readonly id: string;
  public readonly householdId: string;
  public readonly createdById: string;
  public label: string;
  public amount: number;
  public category: string | null;
  public date: Date;
  public readonly createdAt: Date;

  constructor(props: BudgetEntryProps) {
    this.validateLabel(props.label);
    this.validateAmount(props.amount);

    this.id = props.id;
    this.householdId = props.householdId;
    this.createdById = props.createdById;
    this.label = props.label.trim();
    this.amount = props.amount;
    this.category = props.category ?? null;
    this.date = props.date;
    this.createdAt = props.createdAt ?? new Date();
  }

  update(params: UpdateBudgetEntryParams): void {
    if (params.label !== undefined) {
      this.validateLabel(params.label);
      this.label = params.label.trim();
    }
    if (params.amount !== undefined) {
      this.validateAmount(params.amount);
      this.amount = params.amount;
    }
    if (params.category !== undefined) {
      this.category = params.category;
    }
    if (params.date !== undefined) {
      this.date = params.date;
    }
  }

  private validateLabel(label: string): void {
    const trimmed = label.trim();
    if (trimmed.length < 1 || trimmed.length > BUDGET_ENTRY_LABEL_MAX) {
      throw new InvalidBudgetEntryException(
        `Le libellé doit contenir entre 1 et ${BUDGET_ENTRY_LABEL_MAX} caractères.`,
      );
    }
  }

  private validateAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new InvalidBudgetEntryException(
        'Le montant doit être un nombre positif.',
      );
    }
  }
}