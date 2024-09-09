import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationGateway } from '../gateway/notification.gateway';
import { Notification } from '../models/notification.model';
import { NotificationStatus } from '../enums/notification-status.enum';

@Injectable()
export class NotificationService {

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Retrieves all notifications for a specific user.
   * @param {number} userId - The ID of the user whose notifications are to be fetched.
   * @returns {Promise<Notification[]>} - A promise that resolves to an array of notifications for the user.
   */
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.findNotificationsByUserId(userId);
  }

  /**
   * Creates a new notification for a user and sends it through WebSocket.
   * @param {number} userId - The ID of the user to receive the notification.
   * @param {string} message - The message content of the notification.
   * @returns {Promise<Notification>} - A promise that resolves to the newly created notification.
   */
  async createNotification(userId: number, message: string): Promise<Notification> {
    const notification = await this.notificationRepository.createNotification(userId, message, NotificationStatus.DELIVERED);
    this.notificationGateway.notifyUsers(userId, notification);
    return notification;
  }

  /**
   * Marks a specific notification as read.
   * @param {number} userId - The ID of the user who owns the notification.
   * @param {number} notificationId - The ID of the notification to be marked as read.
   * @returns {Promise<Notification>} - A promise that resolves to the updated notification.
   */
  async markNotificationAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.updateNotificationStatus(userId, notificationId, NotificationStatus.READ);
    return notification;
  }
}
