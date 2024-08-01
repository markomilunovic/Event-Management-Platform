import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationGateway } from '../gateway/notification.gateway';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationService {

    constructor(private readonly notificationRepository: NotificationRepository,
                private readonly notificationGateway: NotificationGateway,
    ) {}

    async getNotificationsByUser(userId: number): Promise<Notification[]> {
        return this.notificationRepository.findNotificationsByUserId(userId);
  }

  async createNotification(userId: number, message: string): Promise<Notification> {
    const notification = await this.notificationRepository.createNotification(userId, message, 'delivered');
    this.notificationGateway.notifyUsers(userId, notification);
    return notification;
  }
}
