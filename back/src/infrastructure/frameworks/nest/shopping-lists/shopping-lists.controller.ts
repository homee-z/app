import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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

type AuthUser = { sub: string };

// ParseUUIDPipe : un id mal formé renvoie 400 au lieu d'une erreur Postgres (500).
const uuid = new ParseUUIDPipe();

// La validation des DTO est assurée par le ValidationPipe global (main.ts).
@Controller('households/:householdId/shopping-lists')
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
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
  ) {
    return this.listShoppingLists.execute({ userId: user.sub, householdId });
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('id', uuid) id: string,
  ) {
    return this.getShoppingList.execute({ userId: user.sub, householdId, id });
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Body() dto: CreateShoppingListDto,
  ) {
    return this.createShoppingList.execute({
      userId: user.sub,
      householdId,
      name: dto.name,
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('id', uuid) id: string,
    @Body() dto: UpdateShoppingListDto,
  ) {
    return this.updateShoppingList.execute({
      userId: user.sub,
      householdId,
      id,
      name: dto.name,
    });
  }

  @Patch(':id/chore')
  linkToChore(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('id', uuid) id: string,
    @Body() dto: LinkShoppingListToChoreDto,
  ) {
    return this.linkShoppingListToChore.execute({
      userId: user.sub,
      householdId,
      id,
      choreId: dto.choreId,
    });
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('id', uuid) id: string,
  ) {
    return this.deleteShoppingList.execute({
      userId: user.sub,
      householdId,
      id,
    });
  }
}