import { IsNotEmpty, IsUUID } from 'class-validator';

export class LinkShoppingListToChoreDto {
  @IsUUID()
  @IsNotEmpty()
  choreId: string;
}