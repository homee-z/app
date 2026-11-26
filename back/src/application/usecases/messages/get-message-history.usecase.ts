import { MessageRepositoryInterface } from '../../repositories/message.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { requireActiveMember } from '../households/household-access';

export interface GetMessageHistoryCommand {
  userId: string;
  householdId: string;
  limit?: number;
  before?: Date;
}

export interface MessageSummary {
  id: string;
  householdId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

const DEFAULT_LIMIT = 50;

export class GetMessageHistoryUseCase {
  constructor(
    private readonly messageRepository: MessageRepositoryInterface,
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async execute(
    command: GetMessageHistoryCommand,
  ): Promise<MessageSummary[]> {
    await requireActiveMember(
      this.householdMemberRepository,
      command.householdId,
      command.userId,
    );

    const messages = await this.messageRepository.findAllByHousehold(
      command.householdId,
      { limit: command.limit ?? DEFAULT_LIMIT, before: command.before },
    );

    return messages.map((message) => ({
      id: message.id,
      householdId: message.householdId,
      authorId: message.authorId,
      content: message.content,
      createdAt: message.createdAt,
    }));
  }
}