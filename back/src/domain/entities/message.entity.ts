import { DomainError } from '../errors/domain.error';

export const MESSAGE_CONTENT_MAX = 2000;

export class InvalidMessageContentException extends DomainError {
  constructor() {
    super(
      `Le message doit contenir entre 1 et ${MESSAGE_CONTENT_MAX} caractères.`,
    );
    this.name = 'InvalidMessageContentException';
  }
}

export interface MessageProps {
  id: string;
  householdId: string;
  authorId: string;
  content: string;
  createdAt?: Date;
}

// Un message est immuable : pas d'édition ni de suppression (hors scope actuel).
export class MessageEntity {
  public readonly id: string;
  public readonly householdId: string;
  public readonly authorId: string;
  public readonly content: string;
  public readonly createdAt: Date;

  constructor(props: MessageProps) {
    const trimmed = props.content.trim();
    if (trimmed.length < 1 || trimmed.length > MESSAGE_CONTENT_MAX) {
      throw new InvalidMessageContentException();
    }
    this.id = props.id;
    this.householdId = props.householdId;
    this.authorId = props.authorId;
    this.content = trimmed;
    this.createdAt = props.createdAt ?? new Date();
  }
}