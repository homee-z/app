import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { BUDGET_ENTRY_LABEL_MAX } from '../../../../../domain/entities/budget-entry.entity';

export class CreateBudgetEntryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(BUDGET_ENTRY_LABEL_MAX)
  label: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsDateString()
  date: string;
}