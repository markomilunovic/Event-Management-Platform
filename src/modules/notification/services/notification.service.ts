import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationGateway } from '../gateway/notification.gateway';
import { Notification } from '../entities/notification.entities';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Retrieves all notifications for a specific user.
   * @param {number} userId - The ID of the user whose notifications are to be fetched.
   * @returns {Promise<Notification[]>} - A promise that resolves to an array of notifications for the user.
   * @throws InternalServerErrorException if there is an issue retrieving notifications.
   */
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    const traceId = uuidv4();
    try {
      return await this.notificationRepository.findNotificationsByUserId(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error retrieving notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error retrieving notifications',
        traceId,
      });
    }
  }

  /**
   * Creates a new notification for a user and sends it through WebSocket.
   * @param {number} userId - The ID of the user to receive the notification.
   * @param {string} message - The message content of the notification.
   * @returns {Promise<Notification>} - A promise that resolves to the newly created notification.
   * @throws InternalServerErrorException if there is an issue creating the notification.
   */
  async createNotification(
    userId: number,
    message: string,
  ): Promise<Notification> {
    const traceId = uuidv4();
    try {
      const notification = await this.notificationRepository.createNotification(
        userId,
        message,
        NotificationStatus.DELIVERED,
      );
      this.notificationGateway.notifyUsers(userId, notification);
      return notification;
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error creating notification for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error creating notification',
        traceId,
      });
    }
  }

  /**
   * Marks a specific notification as read.
   * @param {number} userId - The ID of the user who owns the notification.
   * @param {number} notificationId - The ID of the notification to be marked as read.
   * @returns {Promise<Notification>} - A promise that resolves to the updated notification.
   * @throws InternalServerErrorException if there is an issue marking the notification as read.
   */
  async markNotificationAsRead(
    userId: number,
    notificationId: number,
  ): Promise<Notification> {
    const traceId = uuidv4();
    try {
      const notification =
        await this.notificationRepository.updateNotificationStatus(
          userId,
          notificationId,
          NotificationStatus.READ,
        );
      return notification;
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error marking notification ${notificationId} as read for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error marking notification as read',
        traceId,
      });
    }
  }
}
