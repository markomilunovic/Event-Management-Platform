import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { NotificationStatus } from '../enums/notification-status.enum';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification) private notificationModel: typeof Notification,
  ) {}

  async findNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.notificationModel.findAll({ where: { userId } });
  }

  async createNotification(
    userId: number,
    message: string,
    status: NotificationStatus,
  ): Promise<Notification> {
    return this.notificationModel.create({ userId, message, status });
  }

  async updateNotificationStatus(
    userId: number,
    notificationId: number,
    status: NotificationStatus,
  ): Promise<Notification> {
    const notification = await this.notificationModel.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.status = status;
    await notification.save();
    return notification;
  }
}
