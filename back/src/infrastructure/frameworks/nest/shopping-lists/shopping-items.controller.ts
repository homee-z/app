import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/update-shopping-item.usecase';
import { ToggleShoppingItemCheckedUseCase } from '../../../../application/usecases/shopping-lists/toggle-shopping-item-checked.usecase';
import { DeleteShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/delete-shopping-item.usecase';
import { LinkShoppingItemToRecipeIngredientUseCase } from '../../../../application/usecases/shopping-lists/link-shopping-item-to-recipe-ingredient.usecase';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto';
import { LinkShoppingItemToRecipeIngredientDto } from './dto/link-shopping-item-to-recipe-ingredient.dto';

// La validation du DTO est assurée par le ValidationPipe global (main.ts).
@Controller('shopping-items')
@UseGuards(AuthGuard)
export class ShoppingItemsController {
  constructor(
    private readonly updateShoppingItem: UpdateShoppingItemUseCase,
    private readonly toggleShoppingItemChecked: ToggleShoppingItemCheckedUseCase,
    private readonly deleteShoppingItem: DeleteShoppingItemUseCase,
    private readonly linkShoppingItemToRecipeIngredient: LinkShoppingItemToRecipeIngredientUseCase,
  ) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShoppingItemDto) {
    return this.updateShoppingItem.execute({
      id,
      name: dto.name,
      quantity: dto.quantity,
    });
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.toggleShoppingItemChecked.execute({ id });
  }

  @Patch(':id/recipe-ingredient')
  linkToRecipeIngredient(
    @Param('id') id: string,
    @Body() dto: LinkShoppingItemToRecipeIngredientDto,
  ) {
    return this.linkShoppingItemToRecipeIngredient.execute({
      id,
      recipeIngredientId: dto.recipeIngredientId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteShoppingItem.execute({ id });
  }
}