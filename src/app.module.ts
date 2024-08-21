import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/user/models/user.model';
import { AccessToken } from './modules/auth/models/access-token.model';
import { RefreshToken } from './modules/auth/models/refresh-token.model';
import { Event } from './modules/event/models/event.model';
import { EventModule } from './modules/event/event.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { Ticket } from './modules/ticket/models/ticket.model';
import { NotificationModule } from './modules/notification/notification.module';
import { Notification } from './modules/notification/models/notification.model';
import { CachingModule } from './modules/caching/caching.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: configService.get<any>('DB_DIALECT'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: true,
        models: [User, AccessToken, RefreshToken, Event, Ticket, Notification],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    EventModule,
    TicketModule,
    NotificationModule,
    CachingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
