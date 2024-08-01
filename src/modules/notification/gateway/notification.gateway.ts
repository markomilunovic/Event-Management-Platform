import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/modules/auth/interfaces/token-payloads.interface';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const userId = this.getUserIdFromClient(client);
    if (userId) {
      client.join(userId.toString());
      console.log(`User with ID ${userId} joined room ${userId}`);
    } else {
      console.log('User ID not found, connection unauthorized');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  getUserIdFromClient(client: Socket): number | null {
    try {
      let token: string | undefined;
  
      // Extract token from query parameters
      if (client.handshake.query.token) {
        token = Array.isArray(client.handshake.query.token) ? client.handshake.query.token[0] : client.handshake.query.token;
        console.log('Received token from query:', token);
      }
  
      // Extract token from Authorization header
      if (!token && client.handshake.headers.authorization) {
        const authorizationHeader = client.handshake.headers.authorization;
        token = authorizationHeader.split(' ')[1];
        console.log('Received token from header:', token);
      }
  
      if (!token) {
        throw new Error('Token not provided');
      }
  
      // Verify and decode the token
      const decoded = this.jwtService.verify<JwtPayload>(token);
      console.log('Decoded user ID:', decoded.sub);
      return decoded.sub;
    } catch (error) {
      console.error('Failed to extract user ID from token', error);
      return null;
    }
  }
  

  notifyUsers(userId: number, notification: any) {
    this.server.to(userId.toString()).emit('notification', notification);
  }
}

