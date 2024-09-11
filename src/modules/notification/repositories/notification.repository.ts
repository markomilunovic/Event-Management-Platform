import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationStatus } from '../enums/notification-status.enum';
import { Notification } from '../entities/notification.entities';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({ where: { userId } });
  }

  async createNotification(
    userId: number,
    message: string,
    status: NotificationStatus,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      message,
      status,
    });
    return this.notificationRepository.save(notification);
  }

  async updateNotificationStatus(
    userId: number,
    notificationId: number,
    status: NotificationStatus,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.status = status;
    return this.notificationRepository.save(notification);
  }
}
