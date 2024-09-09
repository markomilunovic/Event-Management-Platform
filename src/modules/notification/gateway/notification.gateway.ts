import { Inject, LoggerService } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';

import { JwtPayload } from '@modules/auth/interfaces/token-payloads.interface';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromClient(client);
    if (userId) {
      client.join(userId.toString());
      this.logger.log(`User with ID ${userId} joined room ${userId}`);
    } else {
      this.logger.warn('User ID not found, connection unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  getUserIdFromClient(client: Socket): number | null {
    try {
      let token: string | undefined;

      // Extract token from query parameters
      if (client.handshake.query.token) {
        token = Array.isArray(client.handshake.query.token)
          ? client.handshake.query.token[0]
          : client.handshake.query.token;
        this.logger.log('Received token from query:', token);
      }

      // Extract token from Authorization header
      if (!token && client.handshake.headers.authorization) {
        const authorizationHeader = client.handshake.headers.authorization;
        token = authorizationHeader.split(' ')[1];
        this.logger.log('Received token from header:', token);
      }

      if (!token) {
        throw new Error('Token not provided');
      }

      // Verify and decode the token
      const decoded = this.jwtService.verify<JwtPayload>(token);
      this.logger.log('Decoded user ID:', decoded.sub);
      return decoded.sub;
    } catch (error) {
      this.logger.error('Failed to extract user ID from token', error);
      return null;
    }
  }

  notifyUsers(userId: number, notification: any) {
    this.logger.log(`Notifying user with ID ${userId}`);
    this.server.to(userId.toString()).emit('notification', notification);
  }
}
