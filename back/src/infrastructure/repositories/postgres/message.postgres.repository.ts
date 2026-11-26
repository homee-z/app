import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { MessageEntity } from '../../../domain/entities/message.entity';
import {
  ListMessagesOptions,
  MessageRepositoryInterface,
} from '../../../application/repositories/message.repository.interface';
import { MessageOrmEntity } from './message.orm-entity';

@Injectable()
export class MessagePostgresRepository implements MessageRepositoryInterface {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repo: Repository<MessageOrmEntity>,
  ) {}

  public async save(message: MessageEntity): Promise<void> {
    await this.repo.save(this.toOrm(message));
  }

  public async findAllByHousehold(
    householdId: string,
    options?: ListMessagesOptions,
  ): Promise<MessageEntity[]> {
    const orms = await this.repo.find({
      where: {
        householdId,
        ...(options?.before ? { createdAt: LessThan(options.before) } : {}),
      },
      order: { createdAt: 'DESC' },
      take: options?.limit,
    });

    return orms.reverse().map((orm) => this.toDomain(orm));
  }

  private toDomain(orm: MessageOrmEntity): MessageEntity {
    return new MessageEntity({
      id: orm.id,
      householdId: orm.householdId,
      authorId: orm.authorId,
      content: orm.content,
      createdAt: orm.createdAt,
    });
  }

  private toOrm(message: MessageEntity): MessageOrmEntity {
    const orm = new MessageOrmEntity();
    orm.id = message.id;
    orm.householdId = message.householdId;
    orm.authorId = message.authorId;
    orm.content = message.content;
    return orm;
  }
}