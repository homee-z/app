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
import { CreateBudgetEntryUseCase } from '../../../../application/usecases/budget/create-budget-entry.usecase';
import { UpdateBudgetEntryUseCase } from '../../../../application/usecases/budget/update-budget-entry.usecase';
import { DeleteBudgetEntryUseCase } from '../../../../application/usecases/budget/delete-budget-entry.usecase';
import { ListBudgetEntriesUseCase } from '../../../../application/usecases/budget/list-budget-entries.usecase';
import { CreateBudgetEntryDto } from './dto/create-budget-entry.dto';
import { UpdateBudgetEntryDto } from './dto/update-budget-entry.dto';

type AuthUser = { sub: string };

const uuid = new ParseUUIDPipe();

@Controller('households/:householdId/budget-entries')
@UseGuards(AuthGuard)
export class BudgetController {
  constructor(
    private readonly createBudgetEntry: CreateBudgetEntryUseCase,
    private readonly updateBudgetEntry: UpdateBudgetEntryUseCase,
    private readonly deleteBudgetEntry: DeleteBudgetEntryUseCase,
    private readonly listBudgetEntries: ListBudgetEntriesUseCase,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
  ) {
    return this.listBudgetEntries.execute({
      userId: user.sub,
      householdId,
    });
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Body() dto: CreateBudgetEntryDto,
  ) {
    return this.createBudgetEntry.execute({
      userId: user.sub,
      householdId,
      label: dto.label,
      amount: dto.amount,
      category: dto.category,
      date: new Date(dto.date),
    });
  }

  @Patch(':entryId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('entryId', uuid) entryId: string,
    @Body() dto: UpdateBudgetEntryDto,
  ) {
    return this.updateBudgetEntry.execute({
      userId: user.sub,
      householdId,
      entryId,
      label: dto.label,
      amount: dto.amount,
      category: dto.category,
      date: dto.date ? new Date(dto.date) : undefined,
    });
  }

  @Delete(':entryId')
  delete(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Param('entryId', uuid) entryId: string,
  ) {
    return this.deleteBudgetEntry.execute({
      userId: user.sub,
      householdId,
      entryId,
    });
  }
}