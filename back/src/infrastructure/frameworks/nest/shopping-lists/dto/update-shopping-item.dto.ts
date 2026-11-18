import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateShoppingItemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  quantity?: string | null;
}