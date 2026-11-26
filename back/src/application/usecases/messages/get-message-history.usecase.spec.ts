import { GetMessageHistoryUseCase } from './get-message-history.usecase';
import { MessageRepositoryInterface } from '../../repositories/message.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { MessageEntity } from '../../../domain/entities/message.entity';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('GetMessageHistoryUseCase', () => {
  let messageRepository: MessageRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: GetMessageHistoryUseCase;

  beforeEach(() => {
    messageRepository = {
      save: jest.fn(),
      findAllByHousehold: jest.fn(),
    };

    householdMemberRepository = {
      findOne: jest.fn(),
      findByUser: jest.fn(),
      findByHousehold: jest.fn(),
      countActiveAdmins: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetMessageHistoryUseCase(
      messageRepository,
      householdMemberRepository,
    );
  });

  it('returns the message history for a household when the user is an active member', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
    const messages = [
      new MessageEntity({
        id: 'message-1',
        householdId: 'household-1',
        authorId: 'user-2',
        content: 'Salut !',
      }),
      new MessageEntity({
        id: 'message-2',
        householdId: 'household-1',
        authorId: 'user-1',
        content: 'Hello !',
      }),
    ];
    (messageRepository.findAllByHousehold as jest.Mock).mockResolvedValue(
      messages,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
    });

    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('Salut !');
    expect(messageRepository.findAllByHousehold).toHaveBeenCalledWith(
      'household-1',
      { limit: 50, before: undefined },
    );
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-1', householdId: 'household-1' }),
    ).rejects.toThrow(NotFoundError);
    expect(messageRepository.findAllByHousehold).not.toHaveBeenCalled();
  });

  it('forwards a custom limit and before cursor to the repository', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      HouseholdMember.createAdmin('member-1', 'user-1', 'household-1'),
    );
    (messageRepository.findAllByHousehold as jest.Mock).mockResolvedValue([]);
    const before = new Date('2026-01-01T00:00:00.000Z');

    await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      limit: 10,
      before,
    });

    expect(messageRepository.findAllByHousehold).toHaveBeenCalledWith(
      'household-1',
      { limit: 10, before },
    );
  });
});