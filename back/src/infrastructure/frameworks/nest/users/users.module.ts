import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../../../repositories/postgres/user.orm-entity';
import { UserPostgresRepository } from '../../../repositories/postgres/user.postgres.repository';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../../../../application/repositories/user.repository.interface';
import { GetProfileUsecase } from '../../../../application/usecases/users/get-profile.usecase';
import { UpdateProfileUsecase } from '../../../../application/usecases/users/update-profile.usecase';
import {
  DeleteAccountUsecase,
  DeletableUserRepository,
} from '../../../../application/usecases/users/delete-account.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserPostgresRepository },
    {
      provide: GetProfileUsecase,
      useFactory: (repo: UserRepositoryInterface) =>
        new GetProfileUsecase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: UpdateProfileUsecase,
      useFactory: (repo: UserRepositoryInterface) =>
        new UpdateProfileUsecase(repo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: DeleteAccountUsecase,
      useFactory: (repo: DeletableUserRepository) =>
        new DeleteAccountUsecase(repo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [
    USER_REPOSITORY,
    GetProfileUsecase,
    UpdateProfileUsecase,
    DeleteAccountUsecase,
  ],
})
export class UsersModule {}
