import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/user/entities/user.entity';
import { AccessToken } from './modules/auth/entities/access-token.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { Event } from './modules/event/entities/event.entity';
import { Ticket } from './modules/ticket/entities/ticket.entity';
import { Notification } from './modules/notification/entities/notification.entities';
import { UserActivity } from './modules/user/entities/user-activity.entity';
import { AuthModule } from './modules/auth/auth.module';
import { EventModule } from './modules/event/event.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CachingModule } from './modules/caching/caching.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { LoggerModule } from '@modules/logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'filters/http-exception.filter';
import { TraceIdMiddleware } from '@modules/logger/trace-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<string>('DB_DIALECT') as any,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          AccessToken,
          RefreshToken,
          Event,
          Ticket,
          Notification,
          UserActivity,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      AccessToken,
      RefreshToken,
      Event,
      Ticket,
      Notification,
      UserActivity,
    ]),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} [${level}]: ${message}`;
            }),
          ),
        }),
      ],
    }),
    AuthModule,
    EventModule,
    TicketModule,
    NotificationModule,
    CachingModule,
    AnalyticsModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, 
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*'); 
  }
}
