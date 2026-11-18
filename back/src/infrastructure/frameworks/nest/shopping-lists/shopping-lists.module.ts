import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';
import { ShoppingListOrmEntity } from '../../../repositories/postgres/shopping-list.orm-entity';
import { ShoppingListPostgresRepository } from '../../../repositories/postgres/shopping-list.postgres.repository';
import { ShoppingItemOrmEntity } from '../../../repositories/postgres/shopping-item.orm-entity';
import { ShoppingItemPostgresRepository } from '../../../repositories/postgres/shopping-item.postgres.repository';
import {
  SHOPPING_LIST_REPOSITORY,
  ShoppingListRepositoryInterface,
} from '../../../../application/repositories/shopping-list.repository.interface';
import {
  SHOPPING_ITEM_REPOSITORY,
  ShoppingItemRepositoryInterface,
} from '../../../../application/repositories/shopping-item.repository.interface';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingListOrmEntity, ShoppingItemOrmEntity]),
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
      provide: CreateShoppingListUseCase,
      useFactory: (repo: ShoppingListRepositoryInterface) =>
        new CreateShoppingListUseCase(repo),
      inject: [SHOPPING_LIST_REPOSITORY],
    },
    {
      provide: UpdateShoppingListUseCase,
      useFactory: (repo: ShoppingListRepositoryInterface) =>
        new UpdateShoppingListUseCase(repo),
      inject: [SHOPPING_LIST_REPOSITORY],
    },
    {
      provide: DeleteShoppingListUseCase,
      useFactory: (repo: ShoppingListRepositoryInterface) =>
        new DeleteShoppingListUseCase(repo),
      inject: [SHOPPING_LIST_REPOSITORY],
    },
    {
      provide: LinkShoppingListToChoreUseCase,
      useFactory: (repo: ShoppingListRepositoryInterface) =>
        new LinkShoppingListToChoreUseCase(repo),
      inject: [SHOPPING_LIST_REPOSITORY],
    },
    {
      provide: GetShoppingListUseCase,
      useFactory: (repo: ShoppingListRepositoryInterface) =>
        new GetShoppingListUseCase(repo),
      inject: [SHOPPING_LIST_REPOSITORY],
    },
    {
      provide: ListShoppingListsUseCase,
      useFactory: (repo: ShoppingListRepositoryInterface) =>
        new ListShoppingListsUseCase(repo),
      inject: [SHOPPING_LIST_REPOSITORY],
    },
    {
      provide: AddShoppingItemUseCase,
      useFactory: (repo: ShoppingItemRepositoryInterface) =>
        new AddShoppingItemUseCase(repo),
      inject: [SHOPPING_ITEM_REPOSITORY],
    },
    {
      provide: UpdateShoppingItemUseCase,
      useFactory: (repo: ShoppingItemRepositoryInterface) =>
        new UpdateShoppingItemUseCase(repo),
      inject: [SHOPPING_ITEM_REPOSITORY],
    },
    {
      provide: ToggleShoppingItemCheckedUseCase,
      useFactory: (repo: ShoppingItemRepositoryInterface) =>
        new ToggleShoppingItemCheckedUseCase(repo),
      inject: [SHOPPING_ITEM_REPOSITORY],
    },
    {
      provide: DeleteShoppingItemUseCase,
      useFactory: (repo: ShoppingItemRepositoryInterface) =>
        new DeleteShoppingItemUseCase(repo),
      inject: [SHOPPING_ITEM_REPOSITORY],
    },
    {
      provide: LinkShoppingItemToRecipeIngredientUseCase,
      useFactory: (repo: ShoppingItemRepositoryInterface) =>
        new LinkShoppingItemToRecipeIngredientUseCase(repo),
      inject: [SHOPPING_ITEM_REPOSITORY],
    },
    {
      provide: ListShoppingItemsUseCase,
      useFactory: (repo: ShoppingItemRepositoryInterface) =>
        new ListShoppingItemsUseCase(repo),
      inject: [SHOPPING_ITEM_REPOSITORY],
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