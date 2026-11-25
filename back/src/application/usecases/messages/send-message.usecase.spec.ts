import { SendMessageUseCase } from './send-message.usecase';
import { MessageRepositoryInterface } from '../../repositories/message.repository.interface';
import { HouseholdMemberRepositoryInterface } from '../../repositories/household-member.repository.interface';
import { HouseholdMember } from '../../../domain/entities/household-member.entity';
import { NotFoundError } from '../../../domain/errors/not-found.error';

describe('SendMessageUseCase', () => {
  let messageRepository: MessageRepositoryInterface;
  let householdMemberRepository: HouseholdMemberRepositoryInterface;
  let useCase: SendMessageUseCase;

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

    useCase = new SendMessageUseCase(
      messageRepository,
      householdMemberRepository,
    );
  });

  it('sends a message when the user is an active member of the household', async () => {
    const membership = HouseholdMember.createAdmin(
      'member-1',
      'user-1',
      'household-1',
    );
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(
      membership,
    );

    const result = await useCase.execute({
      userId: 'user-1',
      householdId: 'household-1',
      content: 'Bonjour tout le monde !',
    });

    expect(result.householdId).toBe('household-1');
    expect(result.authorId).toBe('user-1');
    expect(result.content).toBe('Bonjour tout le monde !');
    expect(messageRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundError when the user is not an active member of the household', async () => {
    (householdMemberRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        householdId: 'household-1',
        content: 'Bonjour tout le monde !',
      }),
    ).rejects.toThrow(NotFoundError);
    expect(messageRepository.save).not.toHaveBeenCalled();
  });
});