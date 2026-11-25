import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { BUDGET_ENTRY_LABEL_MAX } from '../../../../../domain/entities/budget-entry.entity';

export class UpdateBudgetEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(BUDGET_ENTRY_LABEL_MAX)
  label?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string | null;

  @IsOptional()
  @IsDateString()
  date?: string;
}