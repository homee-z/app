import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';
import { HouseholdsModule } from '../households/households.module';
import { MessageOrmEntity } from '../../../repositories/postgres/message.orm-entity';
import { MessagePostgresRepository } from '../../../repositories/postgres/message.postgres.repository';
import {
  MESSAGE_REPOSITORY,
  MessageRepositoryInterface,
} from '../../../../application/repositories/message.repository.interface';
import {
  HOUSEHOLD_MEMBER_REPOSITORY,
  HouseholdMemberRepositoryInterface,
} from '../../../../application/repositories/household-member.repository.interface';
import { SendMessageUseCase } from '../../../../application/usecases/messages/send-message.usecase';
import { GetMessageHistoryUseCase } from '../../../../application/usecases/messages/get-message-history.usecase';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';

type Messages = MessageRepositoryInterface;
type Members = HouseholdMemberRepositoryInterface;

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageOrmEntity]),
    AuthModule,
    HouseholdsModule,
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: MESSAGE_REPOSITORY,
      useClass: MessagePostgresRepository,
    },
    {
      provide: SendMessageUseCase,
      useFactory: (repo: Messages, members: Members) =>
        new SendMessageUseCase(repo, members),
      inject: [MESSAGE_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    {
      provide: GetMessageHistoryUseCase,
      useFactory: (repo: Messages, members: Members) =>
        new GetMessageHistoryUseCase(repo, members),
      inject: [MESSAGE_REPOSITORY, HOUSEHOLD_MEMBER_REPOSITORY],
    },
    MessagesGateway,
  ],
  exports: [MESSAGE_REPOSITORY, SendMessageUseCase, GetMessageHistoryUseCase],
})
export class MessagesModule {}