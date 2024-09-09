import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationRepository {

    constructor(
        @InjectModel(Notification) private notificationModel: typeof Notification,
    ) { }

    async findNotificationsByUserId(userId: number): Promise<Notification[]> {
        return this.notificationModel.findAll({ where: { userId } });
    }

    // Status parametar treba odvojiti u poseban ENUM ili neku drugu staticku vrednost koja ce biti definisana na jednom mestu
    // Ovako ako uvedemo novi status u buducnosti moramo da idemo na svakom mestu posebno da dodajemo
    async createNotification(userId: number, message: string, status: 'delivered' | 'read' | 'blocked'): Promise<Notification> {
        return this.notificationModel.create({ userId, message, status });
    }

    /**
     * Updates notifications status based on status parameter.
     * @param {number} userId - 
     * @param {number} notificationId -
     * @param status - 
     * @returns {Promise<Notification>} - Returns promise that resolves to Notification entity.
     */
    async updateNotificationStatus(userId: number, notificationId: number, status: 'delivered' | 'read'): Promise<Notification> {
        const notification = await this.notificationModel.findOne({ where: { id: notificationId, userId } });
        // Treba obrnuti logiku, ovo nije toliko dobra praksa iako radi.
        // Hocemo da radimo error handling first, znaci proveravamo da li nesto ne postoji, bacamo gresku ako je tako
        // U suprotnom izvrsavamo kod normalno
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.status = status;
        await notification.save();
        return notification;
    }
}
