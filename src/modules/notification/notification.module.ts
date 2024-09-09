import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { NotificationController } from './controllers/notification.controller';
import { NotificationGateway } from './gateway/notification.gateway';
import { Notification } from './models/notification.model';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { User } from '../user/models/user.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forFeature([Notification, User]),
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
