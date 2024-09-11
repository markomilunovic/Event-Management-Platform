import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../modules/user/entities/user.entity';
import { Ticket } from '../modules/ticket/entities/ticket.entity';
import { AccessToken } from '../modules/auth/entities/access-token.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { UserActivity } from '../modules/user/entities/user-activity.entity';
import { Event } from '../modules/event/entities/event.entity';
import { Notification } from '../modules/notification/entities/notification.entities';

config();

ConfigModule.forRoot({
  isGlobal: true,
});

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: configService.get<string>('DB_DIALECT') as any,
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [User, Event, Ticket, AccessToken, RefreshToken, UserActivity, Notification],
  migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
  synchronize: false,
});
