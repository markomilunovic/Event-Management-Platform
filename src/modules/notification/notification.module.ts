import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationController } from './controllers/notification.controller';
import { NotificationGateway } from './gateway/notification.gateway';
import { Notification } from './entities/notification.entities';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { User } from '../user/entities/user.entity';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Notification, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>('ACCESS_TOKEN_EXP_TIME_IN_DAYS')}d`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationService, NotificationRepository, NotificationGateway],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
