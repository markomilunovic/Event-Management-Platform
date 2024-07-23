import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notification } from './models/notification.model';
import { User } from '../user/models/user.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([Notification, User])
  ],
  providers: [],
  controllers: []
})
export class NotificationModule {}
