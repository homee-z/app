import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateShoppingListUseCase } from '../../../../application/usecases/shopping-lists/create-shopping-list.usecase';
import { UpdateShoppingListUseCase } from '../../../../application/usecases/shopping-lists/update-shopping-list.usecase';
import { DeleteShoppingListUseCase } from '../../../../application/usecases/shopping-lists/delete-shopping-list.usecase';
import { LinkShoppingListToChoreUseCase } from '../../../../application/usecases/shopping-lists/link-shopping-list-to-chore.usecase';
import { GetShoppingListUseCase } from '../../../../application/usecases/shopping-lists/get-shopping-list.usecase';
import { ListShoppingListsUseCase } from '../../../../application/usecases/shopping-lists/list-shopping-lists.usecase';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { UpdateShoppingListDto } from './dto/update-shopping-list.dto';
import { LinkShoppingListToChoreDto } from './dto/link-shopping-list-to-chore.dto';

// La validation des DTO est assurée par le ValidationPipe global (main.ts).
@Controller('shopping-lists')
@UseGuards(AuthGuard)
export class ShoppingListsController {
  constructor(
    private readonly createShoppingList: CreateShoppingListUseCase,
    private readonly updateShoppingList: UpdateShoppingListUseCase,
    private readonly deleteShoppingList: DeleteShoppingListUseCase,
    private readonly linkShoppingListToChore: LinkShoppingListToChoreUseCase,
    private readonly getShoppingList: GetShoppingListUseCase,
    private readonly listShoppingLists: ListShoppingListsUseCase,
  ) {}

  @Get()
  findAll(@CurrentUser('householdId') householdId: string) {
    return this.listShoppingLists.execute({ householdId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getShoppingList.execute({ id });
  }

  @Post()
  create(
    @CurrentUser('householdId') householdId: string,
    @Body() dto: CreateShoppingListDto,
  ) {
    return this.createShoppingList.execute({
      householdId,
      name: dto.name,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShoppingListDto) {
    return this.updateShoppingList.execute({ id, name: dto.name });
  }

  @Patch(':id/chore')
  linkToChore(
    @Param('id') id: string,
    @Body() dto: LinkShoppingListToChoreDto,
  ) {
    return this.linkShoppingListToChore.execute({
      id,
      choreId: dto.choreId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteShoppingList.execute({ id });
  }
}