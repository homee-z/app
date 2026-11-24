import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UpdateShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/update-shopping-item.usecase';
import { ToggleShoppingItemCheckedUseCase } from '../../../../application/usecases/shopping-lists/toggle-shopping-item-checked.usecase';
import { DeleteShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/delete-shopping-item.usecase';
import { LinkShoppingItemToRecipeIngredientUseCase } from '../../../../application/usecases/shopping-lists/link-shopping-item-to-recipe-ingredient.usecase';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto';
import { LinkShoppingItemToRecipeIngredientDto } from './dto/link-shopping-item-to-recipe-ingredient.dto';

type AuthUser = { sub: string };

// ParseUUIDPipe : un id mal formé renvoie 400 au lieu d'une erreur Postgres (500).
const uuid = new ParseUUIDPipe();

// La validation du DTO est assurée par le ValidationPipe global (main.ts).
@Controller('households/:householdId/shopping-lists/:listId/items')
@UseGuards(AuthGuard)
export class ShoppingItemsController {
  constructor(
    private readonly updateShoppingItem: UpdateShoppingItemUseCase,
    private readonly toggleShoppingItemChecked: ToggleShoppingItemCheckedUseCase,
    private readonly deleteShoppingItem: DeleteShoppingItemUseCase,
    private readonly linkShoppingItemToRecipeIngredient: LinkShoppingItemToRecipeIngredientUseCase,
  ) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('listId', uuid) listId: string,
    @Param('id', uuid) id: string,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    return this.updateShoppingItem.execute({
      userId: user.sub,
      householdId,
      shoppingListId: listId,
      id,
      name: dto.name,
      quantity: dto.quantity,
    });
  }

  @Patch(':id/toggle')
  toggle(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('listId', uuid) listId: string,
    @Param('id', uuid) id: string,
  ) {
    return this.toggleShoppingItemChecked.execute({
      userId: user.sub,
      householdId,
      shoppingListId: listId,
      id,
    });
  }

  @Patch(':id/recipe-ingredient')
  linkToRecipeIngredient(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('listId', uuid) listId: string,
    @Param('id', uuid) id: string,
    @Body() dto: LinkShoppingItemToRecipeIngredientDto,
  ) {
    return this.linkShoppingItemToRecipeIngredient.execute({
      userId: user.sub,
      householdId,
      shoppingListId: listId,
      id,
      recipeIngredientId: dto.recipeIngredientId,
    });
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('listId', uuid) listId: string,
    @Param('id', uuid) id: string,
  ) {
    return this.deleteShoppingItem.execute({
      userId: user.sub,
      householdId,
      shoppingListId: listId,
      id,
    });
  }
}