import { MessageEntity } from '../../../domain/entities/message.entity';
import {
  ListMessagesOptions,
  MessageRepositoryInterface,
} from '../../../application/repositories/message.repository.interface';

const clone = (message: MessageEntity): MessageEntity =>
  new MessageEntity({
    id: message.id,
    householdId: message.householdId,
    authorId: message.authorId,
    content: message.content,
    createdAt: new Date(message.createdAt),
  });

export class MessageInMemoryRepository implements MessageRepositoryInterface {
  private messages: MessageEntity[] = [];

  async save(message: MessageEntity) {
    this.messages.push(clone(message));
  }

  async findAllByHousehold(householdId: string, options?: ListMessagesOptions) {
    let found = this.messages
      .filter((m) => m.householdId === householdId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (options?.before) {
      found = found.filter((m) => m.createdAt < options.before!);
    }

    if (options?.limit) {
      found = found.slice(-options.limit);
    }

    return found.map(clone);
  }
}