import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SendMessageUseCase } from '../../../../application/usecases/messages/send-message.usecase';
import {
  HOUSEHOLD_MEMBER_REPOSITORY,
  HouseholdMemberRepositoryInterface,
} from '../../../../application/repositories/household-member.repository.interface';
import { requireActiveMember } from '../../../../application/usecases/households/household-access';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

const householdRoom = (householdId: string) => `household:${householdId}`;

// Rooms par foyer : chaque client rejoint explicitement household:<id> après connexion,
// et ne reçoit les messages que des foyers qu'il a rejoints.
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly sendMessage: SendMessageUseCase,
    @Inject(HOUSEHOLD_MEMBER_REPOSITORY)
    private readonly householdMemberRepository: HouseholdMemberRepositoryInterface,
  ) {}

  public async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('Token manquant');

      const payload = await this.jwtService.verifyAsync(token);
      client.data.userId = payload.sub;
    } catch {
      client.emit('error', { message: 'Authentification requise' });
      client.disconnect(true);
    }
  }

  public handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.debug(`Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('joinHousehold')
  public async handleJoinHousehold(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { householdId: string },
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId) {
      client.emit('error', { message: 'Authentification requise' });
      return;
    }

    try {
      await requireActiveMember(
        this.householdMemberRepository,
        payload.householdId,
        userId,
      );
      await client.join(householdRoom(payload.householdId));
      client.emit('joinedHousehold', { householdId: payload.householdId });
    } catch {
      client.emit('error', { message: 'Foyer introuvable ou accès refusé' });
    }
  }

  @SubscribeMessage('leaveHousehold')
  public async handleLeaveHousehold(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { householdId: string },
  ): Promise<void> {
    await client.leave(householdRoom(payload.householdId));
  }

  @SubscribeMessage('sendMessage')
  public async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { householdId: string; content: string },
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId) {
      client.emit('error', { message: 'Authentification requise' });
      return;
    }

    try {
      const message = await this.sendMessage.execute({
        userId,
        householdId: payload.householdId,
        content: payload.content,
      });
      this.server
        .to(householdRoom(payload.householdId))
        .emit('newMessage', message);
    } catch (error) {
      client.emit('error', {
        message: error instanceof Error ? error.message : 'Envoi impossible',
      });
    }
  }

  private extractToken(client: Socket): string | undefined {
    // 1. auth.token (pattern standard du client Socket.io)
    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) return authToken;

    // 2. Cookie access_token (comme pour le REST, en SSR)
    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('access_token='));
      if (match) return decodeURIComponent(match.split('=')[1]);
    }

    // 3. Header Authorization (fallback)
    const authHeader = client.handshake.headers.authorization;
    const [type, token] = authHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}