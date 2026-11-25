import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { SendMessageUseCase } from '../../../../application/usecases/messages/send-message.usecase';
import { GetMessageHistoryUseCase } from '../../../../application/usecases/messages/get-message-history.usecase';
import { SendMessageDto } from './dto/send-message.dto';

type AuthUser = { sub: string };

const uuid = new ParseUUIDPipe();

@Controller('households/:householdId/messages')
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(
    private readonly sendMessage: SendMessageUseCase,
    private readonly getMessageHistory: GetMessageHistoryUseCase,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.getMessageHistory.execute({
      userId: user.sub,
      householdId,
      limit: limit ? Number(limit) : undefined,
      before: before ? new Date(before) : undefined,
    });
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('householdId', uuid) householdId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendMessage.execute({
      userId: user.sub,
      householdId,
      content: dto.content,
    });
  }
}