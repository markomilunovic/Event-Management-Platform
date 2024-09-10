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
import { v4 as uuidv4 } from 'uuid';

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

  /**
   * Handles a new client connection.
   * @param client - The WebSocket client.
   */
  handleConnection(client: Socket) {
    const traceId = uuidv4();
    const userId = this.getUserIdFromClient(client, traceId);
    if (userId) {
      client.join(userId.toString());
      this.logger.log({
        message: `User with ID ${userId} joined room ${userId}`,
        traceId,
      });
    } else {
      this.logger.warn({
        message: 'User ID not found, connection unauthorized',
        traceId,
      });
      client.disconnect(true);
    }
  }

  /**
   * Handles a client disconnection.
   * @param client - The WebSocket client.
   */
  handleDisconnect(client: Socket) {
    const traceId = uuidv4();
    this.logger.log({ message: `Client disconnected: ${client.id}`, traceId });
  }

  /**
   * Extracts the user ID from the WebSocket client using JWT.
   * @param client - The WebSocket client.
   * @param traceId - The unique traceId for logging.
   * @returns The user ID or null if extraction fails.
   */
  getUserIdFromClient(client: Socket, traceId: string): number | null {
    try {
      let token: string | undefined;

      // Extract token from query parameters
      if (client.handshake.query.token) {
        token = Array.isArray(client.handshake.query.token)
          ? client.handshake.query.token[0]
          : client.handshake.query.token;
        this.logger.log({
          message: 'Received token from query',
          token,
          traceId,
        });
      }

      // Extract token from Authorization header
      if (!token && client.handshake.headers.authorization) {
        const authorizationHeader = client.handshake.headers.authorization;
        token = authorizationHeader.split(' ')[1];
        this.logger.log({
          message: 'Received token from header',
          token,
          traceId,
        });
      }

      if (!token) {
        throw new Error('Token not provided');
      }

      // Verify and decode the token
      const decoded = this.jwtService.verify<JwtPayload>(token);
      this.logger.log({
        message: 'Decoded user ID',
        userId: decoded.sub,
        traceId,
      });
      return decoded.sub;
    } catch (error) {
      this.logger.error({
        message: 'Failed to extract user ID from token',
        error,
        traceId,
      });
      return null;
    }
  }

  /**
   * Sends a notification to the specified user.
   * @param userId - The ID of the user to notify.
   * @param notification - The notification data.
   */
  notifyUsers(userId: number, notification: any) {
    const traceId = uuidv4();
    this.logger.log({ message: `Notifying user with ID ${userId}`, traceId });
    this.server.to(userId.toString()).emit('notification', notification);
  }
}
