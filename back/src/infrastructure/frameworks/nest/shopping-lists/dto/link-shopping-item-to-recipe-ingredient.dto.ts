import { IsNotEmpty, IsUUID } from 'class-validator';

export class LinkShoppingItemToRecipeIngredientDto {
  @IsUUID()
  @IsNotEmpty()
  recipeIngredientId: string;
}