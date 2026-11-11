import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../../../repositories/postgres/user.orm-entity';
import { UserPostgresRepository } from '../../../repositories/postgres/user.postgres.repository';
import { USER_REPOSITORY } from '../../../../application/repositories/user.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [{ provide: USER_REPOSITORY, useClass: UserPostgresRepository }],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
