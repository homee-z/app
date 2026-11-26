import { MessageEntity } from '../../domain/entities/message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface ListMessagesOptions {
  limit?: number;
  before?: Date;
}

export interface MessageRepositoryInterface {
  save(message: MessageEntity): Promise<void>;
  findAllByHousehold(
    householdId: string,
    options?: ListMessagesOptions,
  ): Promise<MessageEntity[]>;
}