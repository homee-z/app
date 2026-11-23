import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AddShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/add-shopping-item.usecase';
import { ListShoppingItemsUseCase } from '../../../../application/usecases/shopping-lists/list-shopping-items.usecase';
import { AddShoppingItemDto } from './dto/add-shopping-item.dto';

type AuthUser = { sub: string };

// ParseUUIDPipe : un id mal formé renvoie 400 au lieu d'une erreur Postgres (500).
const uuid = new ParseUUIDPipe();

// La validation du DTO est assurée par le ValidationPipe global (main.ts).
@Controller('households/:householdId/shopping-lists/:listId/items')
@UseGuards(AuthGuard)
export class ShoppingListItemsController {
  constructor(
    private readonly addShoppingItem: AddShoppingItemUseCase,
    private readonly listShoppingItems: ListShoppingItemsUseCase,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('listId', uuid) listId: string,
  ) {
    return this.listShoppingItems.execute({
      userId: user.sub,
      householdId,
      shoppingListId: listId,
    });
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('listId', uuid) listId: string,
    @Body() dto: AddShoppingItemDto,
  ) {
    return this.addShoppingItem.execute({
      userId: user.sub,
      householdId,
      shoppingListId: listId,
      name: dto.name,
      quantity: dto.quantity ?? null,
    });
  }
}