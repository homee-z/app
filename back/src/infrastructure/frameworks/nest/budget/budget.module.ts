import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';
import { BudgetEntryOrmEntity } from '../../../repositories/postgres/budget-entry.orm-entity';
import { BudgetEntryPostgresRepository } from '../../../repositories/postgres/budget-entry.postgres.repository';
import { HouseholdMemberOrmEntity } from '../../../repositories/postgres/household-member.orm-entity';
import { HouseholdMemberPostgresRepository } from '../../../repositories/postgres/household-member.postgres.repository';
import {
  BUDGET_ENTRY_REPOSITORY,
  BudgetEntryRepositoryInterface,
} from '../../../../application/repositories/budget-entry.repository.interface';
import {
  HOUSEHOLD_MEMBER_REPOSITORY,
  HouseholdMemberRepositoryInterface,
} from '../../../../application/repositories/household-member.repository.interface';
import { CreateBudgetEntryUseCase } from '../../../../application/usecases/budget/create-budget-entry.usecase';
import { UpdateBudgetEntryUseCase } from '../../../../application/usecases/budget/update-budget-entry.usecase';
import { DeleteBudgetEntryUseCase } from '../../../../application/usecases/budget/delete-budget-entry.usecase';
import { ListBudgetEntriesUseCase } from '../../../../application/usecases/budget/list-budget-entries.usecase';
import { BudgetController } from './budget.controller';

type Entries = BudgetEntryRepositoryInterface;
type Members = HouseholdMemberRepositoryInterface;

@Module({
  imports: [
    TypeOrmModule.forFeature([BudgetEntryOrmEntity, HouseholdMemberOrmEntity]),
    AuthModule,
  ],
  controllers: [BudgetController],
  providers: [
    {
      provide: BUDGET_ENTRY_REPOSITORY,
      useClass: BudgetEntryPostgresRepository,
    },
    {
      provide: HOUSEHOLD_MEMBER_REPOSITORY,
      useClass: HouseholdMemberPostgresRepository,
    },
    {
      provide: CreateBudgetEntryUseCase,
      useFactory: (repo: Entries, members: Members) =>
        new CreateBudgetEntryUseCase(repo, members),
      inject: [BUDGET_ENTRY_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: UpdateBudgetEntryUseCase,
      useFactory: (repo: Entries, members: Members) =>
        new UpdateBudgetEntryUseCase(repo, members),
      inject: [BUDGET_ENTRY_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: DeleteBudgetEntryUseCase,
      useFactory: (repo: Entries, members: Members) =>
        new DeleteBudgetEntryUseCase(repo, members),
      inject: [BUDGET_ENTRY_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: ListBudgetEntriesUseCase,
      useFactory: (repo: Entries, members: Members) =>
        new ListBudgetEntriesUseCase(repo, members),
      inject: [BUDGET_ENTRY_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
  ],
  exports: [
    BUDGET_ENTRY_REPOSITORY,
    CreateBudgetEntryUseCase,
    UpdateBudgetEntryUseCase,
    DeleteBudgetEntryUseCase,
    ListBudgetEntriesUseCase,
  ],
})
export class BudgetModule {}