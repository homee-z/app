import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';
import { UsersModule } from '../users/users.module';
import { HouseholdOrmEntity } from '../../../repositories/postgres/household.orm-entity';
import { HouseholdMemberOrmEntity } from '../../../repositories/postgres/household-member.orm-entity';
import { HouseholdPostgresRepository } from '../../../repositories/postgres/household.postgres.repository';
import { HouseholdMemberPostgresRepository } from '../../../repositories/postgres/household-member.postgres.repository';
import {
  HOUSEHOLD_REPOSITORY,
  HouseholdRepositoryInterface,
} from '../../../../application/repositories/household.repository.interface';
import {
  DefaultHouseholdRepositoryInterface,
  HOUSEHOLD_MEMBER_REPOSITORY,
} from '../../../../application/repositories/household-member.repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '../../../../application/repositories/user.repository.interface';
import { CreateHouseholdUsecase } from '../../../../application/usecases/households/create-household.usecase';
import { JoinHouseholdUsecase } from '../../../../application/usecases/households/join-household.usecase';
import { ListMyHouseholdsUsecase } from '../../../../application/usecases/households/list-my-households.usecase';
import { ListMembersUsecase } from '../../../../application/usecases/households/list-members.usecase';
import { ApproveMemberUsecase } from '../../../../application/usecases/households/approve-member.usecase';
import { RejectMemberUsecase } from '../../../../application/usecases/households/reject-member.usecase';
import { UpdateMemberRoleUsecase } from '../../../../application/usecases/households/update-member-role.usecase';
import { KickMemberUsecase } from '../../../../application/usecases/households/kick-member.usecase';
import { RegenerateCodeUsecase } from '../../../../application/usecases/households/regenerate-code.usecase';
import { RenameHouseholdUsecase } from '../../../../application/usecases/households/rename-household.usecase';
import { DeleteHouseholdUsecase } from '../../../../application/usecases/households/delete-household.usecase';
import { SetDefaultHouseholdUsecase } from '../../../../application/usecases/households/set-default-household.usecase';
import { HouseholdsController } from './households.controller';

type Households = HouseholdRepositoryInterface;
// Le provider Postgres implémente aussi setDefault (foyer par défaut).
type Members = DefaultHouseholdRepositoryInterface;
type Users = UserRepositoryInterface;

// Pas de module HTTP séparé (contrairement à Users) : AuthModule n'importe pas
// HouseholdsModule, il n'y a donc pas de dépendance circulaire.
// Les modules qui importent HouseholdsModule ne doivent pas être importés par lui
// (ni par AuthModule / UsersModule), pour éviter une dépendance circulaire.
@Module({
  imports: [
    TypeOrmModule.forFeature([HouseholdOrmEntity, HouseholdMemberOrmEntity]),
    UsersModule,
    AuthModule,
  ],
  controllers: [HouseholdsController],
  providers: [
    { provide: HOUSEHOLD_REPOSITORY, useClass: HouseholdPostgresRepository },
    {
      provide: HOUSEHOLD_MEMBER_REPOSITORY,
      useClass: HouseholdMemberPostgresRepository,
    },
    {
      provide: CreateHouseholdUsecase,
      useFactory: (households: Households, members: Members) =>
        new CreateHouseholdUsecase(households, members),
      inject: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: JoinHouseholdUsecase,
      useFactory: (households: Households, members: Members) =>
        new JoinHouseholdUsecase(households, members),
      inject: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: ListMyHouseholdsUsecase,
      useFactory: (households: Households, members: Members) =>
        new ListMyHouseholdsUsecase(households, members),
      inject: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: ListMembersUsecase,
      useFactory: (members: Members, users: Users) =>
        new ListMembersUsecase(members, users),
      inject: [HOUSEHOLD_MEMBER_REPOSITORY, USER_REPOSITORY],
    },
    {
      provide: ApproveMemberUsecase,
      useFactory: (members: Members) => new ApproveMemberUsecase(members),
      inject: [HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: RejectMemberUsecase,
      useFactory: (members: Members) => new RejectMemberUsecase(members),
      inject: [HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: UpdateMemberRoleUsecase,
      useFactory: (members: Members, users: Users) =>
        new UpdateMemberRoleUsecase(members, users),
      inject: [HOUSEHOLD_MEMBER_REPOSITORY, USER_REPOSITORY],
    },
    {
      provide: KickMemberUsecase,
      useFactory: (members: Members) => new KickMemberUsecase(members),
      inject: [HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: RegenerateCodeUsecase,
      useFactory: (households: Households, members: Members) =>
        new RegenerateCodeUsecase(households, members),
      inject: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: RenameHouseholdUsecase,
      useFactory: (households: Households, members: Members) =>
        new RenameHouseholdUsecase(households, members),
      inject: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: DeleteHouseholdUsecase,
      useFactory: (households: Households, members: Members) =>
        new DeleteHouseholdUsecase(households, members),
      inject: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: SetDefaultHouseholdUsecase,
      useFactory: (members: Members) => new SetDefaultHouseholdUsecase(members),
      inject: [HOUSEHOLD_MEMBER_REPOSITORY],
    },
  ],
  // Exportés pour les autres modules (shopping-lists, messages…) : ils importent
  // HouseholdsModule au lieu de redéclarer ces providers, et utilisent requireActiveMember.
  exports: [HOUSEHOLD_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
})
export class HouseholdsModule {}
