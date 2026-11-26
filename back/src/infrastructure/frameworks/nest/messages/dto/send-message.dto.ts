import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MESSAGE_CONTENT_MAX } from '../../../../../domain/entities/message.entity';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MESSAGE_CONTENT_MAX)
  content: string;
}