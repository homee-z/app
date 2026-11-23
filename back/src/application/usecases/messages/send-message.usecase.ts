import { randomUUID } from 'crypto';
import { MessageEntity } from '../../../domain/entities/message.entity';
import { MessageRepositoryInterface } from '../../repositories/message.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';

export interface SendMessageCommand {
  userId: string;
  householdId: string;
  content: string;
}

export interface SendMessageResult {
  id: string;
  householdId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export class SendMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: SendMessageCommand,
  ): Promise<SendMessageResult> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const message = new MessageEntity({
      id: randomUUID(),
      householdId: command.householdId,
      authorId: command.userId,
      content: command.content,
    });

    await this.messageRepository.save(message);

    return {
      id: message.id,
      householdId: message.householdId,
      authorId: message.authorId,
      content: message.content,
      createdAt: message.createdAt,
    };
  }
}