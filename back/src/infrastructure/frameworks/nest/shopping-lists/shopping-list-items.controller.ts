import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AddShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/add-shopping-item.usecase';
import { ListShoppingItemsUseCase } from '../../../../application/usecases/shopping-lists/list-shopping-items.usecase';
import { AddShoppingItemDto } from './dto/add-shopping-item.dto';

// La validation du DTO est assurée par le ValidationPipe global (main.ts).
@Controller('shopping-lists/:listId/items')
@UseGuards(AuthGuard)
export class ShoppingListItemsController {
  constructor(
    private readonly addShoppingItem: AddShoppingItemUseCase,
    private readonly listShoppingItems: ListShoppingItemsUseCase,
  ) {}

  @Get()
  findAll(@Param('listId') listId: string) {
    return this.listShoppingItems.execute({ shoppingListId: listId });
  }

  @Post()
  create(@Param('listId') listId: string, @Body() dto: AddShoppingItemDto) {
    return this.addShoppingItem.execute({
      shoppingListId: listId,
      name: dto.name,
      quantity: dto.quantity ?? null,
    });
  }
}