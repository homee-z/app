import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';
import { ShoppingListOrmEntity } from '../../../repositories/postgres/shopping-list.orm-entity';
import { ShoppingListPostgresRepository } from '../../../repositories/postgres/shopping-list.postgres.repository';
import { ShoppingItemOrmEntity } from '../../../repositories/postgres/shopping-item.orm-entity';
import { ShoppingItemPostgresRepository } from '../../../repositories/postgres/shopping-item.postgres.repository';
import { HouseholdMemberOrmEntity } from '../../../repositories/postgres/household-member.orm-entity';
import { HouseholdMemberPostgresRepository } from '../../../repositories/postgres/household-member.postgres.repository';
import {
  SHOPPING_LIST_REPOSITORY,
  ShoppingListRepositoryInterface,
} from '../../../../application/repositories/shopping-list.repository.interface';
import {
  SHOPPING_ITEM_REPOSITORY,
  ShoppingItemRepositoryInterface,
} from '../../../../application/repositories/shopping-item.repository.interface';
import {
  HOUSEHOLD_MEMBER_REPOSITORY,
  HouseholdMemberRepositoryInterface,
} from '../../../../application/repositories/household-member.repository.interface';
import { CreateShoppingListUseCase } from '../../../../application/usecases/shopping-lists/create-shopping-list.usecase';
import { UpdateShoppingListUseCase } from '../../../../application/usecases/shopping-lists/update-shopping-list.usecase';
import { DeleteShoppingListUseCase } from '../../../../application/usecases/shopping-lists/delete-shopping-list.usecase';
import { LinkShoppingListToChoreUseCase } from '../../../../application/usecases/shopping-lists/link-shopping-list-to-chore.usecase';
import { GetShoppingListUseCase } from '../../../../application/usecases/shopping-lists/get-shopping-list.usecase';
import { ListShoppingListsUseCase } from '../../../../application/usecases/shopping-lists/list-shopping-lists.usecase';
import { AddShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/add-shopping-item.usecase';
import { UpdateShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/update-shopping-item.usecase';
import { ToggleShoppingItemCheckedUseCase } from '../../../../application/usecases/shopping-lists/toggle-shopping-item-checked.usecase';
import { DeleteShoppingItemUseCase } from '../../../../application/usecases/shopping-lists/delete-shopping-item.usecase';
import { LinkShoppingItemToRecipeIngredientUseCase } from '../../../../application/usecases/shopping-lists/link-shopping-item-to-recipe-ingredient.usecase';
import { ListShoppingItemsUseCase } from '../../../../application/usecases/shopping-lists/list-shopping-items.usecase';
import { ShoppingListsController } from './shopping-lists.controller';
import { ShoppingListItemsController } from './shopping-list-items.controller';
import { ShoppingItemsController } from './shopping-items.controller';

type Lists = ShoppingListRepositoryInterface;
type Items = ShoppingItemRepositoryInterface;
type Members = HouseholdMemberRepositoryInterface;

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShoppingListOrmEntity,
      ShoppingItemOrmEntity,
      HouseholdMemberOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [
    ShoppingListsController,
    ShoppingListItemsController,
    ShoppingItemsController,
  ],
  providers: [
    {
      provide: SHOPPING_LIST_REPOSITORY,
      useClass: ShoppingListPostgresRepository,
    },
    {
      provide: SHOPPING_ITEM_REPOSITORY,
      useClass: ShoppingItemPostgresRepository,
    },
    {
      provide: HOUSEHOLD_MEMBER_REPOSITORY,
      useClass: HouseholdMemberPostgresRepository,
    },
    {
      provide: CreateShoppingListUseCase,
      useFactory: (repo: Lists, members: Members) =>
        new CreateShoppingListUseCase(repo, members),
      inject: [SHOPPING_LIST_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: UpdateShoppingListUseCase,
      useFactory: (repo: Lists, members: Members) =>
        new UpdateShoppingListUseCase(repo, members),
      inject: [SHOPPING_LIST_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: DeleteShoppingListUseCase,
      useFactory: (repo: Lists, members: Members) =>
        new DeleteShoppingListUseCase(repo, members),
      inject: [SHOPPING_LIST_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: LinkShoppingListToChoreUseCase,
      useFactory: (repo: Lists, members: Members) =>
        new LinkShoppingListToChoreUseCase(repo, members),
      inject: [SHOPPING_LIST_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: GetShoppingListUseCase,
      useFactory: (repo: Lists, members: Members) =>
        new GetShoppingListUseCase(repo, members),
      inject: [SHOPPING_LIST_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: ListShoppingListsUseCase,
      useFactory: (repo: Lists, members: Members) =>
        new ListShoppingListsUseCase(repo, members),
      inject: [SHOPPING_LIST_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: AddShoppingItemUseCase,
      useFactory: (items: Items, lists: Lists, members: Members) =>
        new AddShoppingItemUseCase(items, lists, members),
      inject: [
        SHOPPING_ITEM_REPOSITORY,
        SHOPPING_LIST_REPOSITORY,
        HOUSEHOLD_MEMBER_REPOSITORY,
      ],
    },
    {
      provide: UpdateShoppingItemUseCase,
      useFactory: (items: Items, lists: Lists, members: Members) =>
        new UpdateShoppingItemUseCase(items, lists, members),
      inject: [
        SHOPPING_ITEM_REPOSITORY,
        SHOPPING_LIST_REPOSITORY,
        HOUSEHOLD_MEMBER_REPOSITORY,
      ],
    },
    {
      provide: ToggleShoppingItemCheckedUseCase,
      useFactory: (items: Items, lists: Lists, members: Members) =>
        new ToggleShoppingItemCheckedUseCase(items, lists, members),
      inject: [
        SHOPPING_ITEM_REPOSITORY,
        SHOPPING_LIST_REPOSITORY,
        HOUSEHOLD_MEMBER_REPOSITORY,
      ],
    },
    {
      provide: DeleteShoppingItemUseCase,
      useFactory: (items: Items, lists: Lists, members: Members) =>
        new DeleteShoppingItemUseCase(items, lists, members),
      inject: [
        SHOPPING_ITEM_REPOSITORY,
        SHOPPING_LIST_REPOSITORY,
        HOUSEHOLD_MEMBER_REPOSITORY,
      ],
    },
    {
      provide: LinkShoppingItemToRecipeIngredientUseCase,
      useFactory: (items: Items, lists: Lists, members: Members) =>
        new LinkShoppingItemToRecipeIngredientUseCase(items, lists, members),
      inject: [
        SHOPPING_ITEM_REPOSITORY,
        SHOPPING_LIST_REPOSITORY,
        HOUSEHOLD_MEMBER_REPOSITORY,
      ],
    },
    {
      provide: ListShoppingItemsUseCase,
      useFactory: (items: Items, lists: Lists, members: Members) =>
        new ListShoppingItemsUseCase(items, lists, members),
      inject: [
        SHOPPING_ITEM_REPOSITORY,
        SHOPPING_LIST_REPOSITORY,
        HOUSEHOLD_MEMBER_REPOSITORY,
      ],
    },
  ],
  exports: [
    SHOPPING_LIST_REPOSITORY,
    SHOPPING_ITEM_REPOSITORY,
    CreateShoppingListUseCase,
    UpdateShoppingListUseCase,
    DeleteShoppingListUseCase,
    LinkShoppingListToChoreUseCase,
    GetShoppingListUseCase,
    ListShoppingListsUseCase,
    AddShoppingItemUseCase,
    UpdateShoppingItemUseCase,
    ToggleShoppingItemCheckedUseCase,
    DeleteShoppingItemUseCase,
    LinkShoppingItemToRecipeIngredientUseCase,
    ListShoppingItemsUseCase,
  ],
})
export class ShoppingListsModule {}