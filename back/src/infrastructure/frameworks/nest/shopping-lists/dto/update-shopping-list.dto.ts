import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateShoppingListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}