import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccessToken } from './modules/auth/models/access-token.model';
import { RefreshToken } from './modules/auth/models/refresh-token.model';
import { CachingModule } from './modules/caching/caching.module';
import { EventModule } from './modules/event/event.module';
import { Event } from './modules/event/models/event.model';
import { Notification } from './modules/notification/models/notification.model';
import { NotificationModule } from './modules/notification/notification.module';
import { Ticket } from './modules/ticket/models/ticket.model';
import { TicketModule } from './modules/ticket/ticket.module';
import { UserActivity } from './modules/user/models/user-activity.model';
import { User } from './modules/user/models/user.model';
import { UserModule } from './modules/user/user.module';
import { LoggerModule } from '@modules/logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from 'filters/http-exception.filter';
import { TraceIdMiddleware } from '@modules/logger/trace-id.middleware';

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
        models: [
          User,
          AccessToken,
          RefreshToken,
          Event,
          Ticket,
          Notification,
          UserActivity,
        ],
      }),
      inject: [ConfigService],
    }),
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
    UserModule,
    AuthModule,
    EventModule,
    TicketModule,
    NotificationModule,
    CachingModule,
    AnalyticsModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // Register Exception Filter globally
    },
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*'); // Apply Middleware globally
  }
}
