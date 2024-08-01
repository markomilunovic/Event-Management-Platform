import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationRepository {

    constructor(
        @InjectModel(Notification) private notificationModel: typeof Notification,
      ) {}
    
    async findNotificationsByUserId(userId: number): Promise<Notification[]> {
        return this.notificationModel.findAll({ where: { userId } });
      }

    async createNotification(userId: number, message: string, status: 'delivered' | 'read'): Promise<Notification> {
        return this.notificationModel.create({ userId, message, status });
    }

}
