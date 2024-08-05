import { Controller, Get, Post, Req, Body, UseGuards } from '@nestjs/common';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { AuthRequest } from 'src/modules/event/interfaces/auth-request.interface';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';

@Controller('notification')
export class NotificationController {

    constructor(private readonly notificationService: NotificationService) {}

    @UseGuards(JwtUserGuard)
    @Get()
    async getNotifications(@Req() req: AuthRequest): Promise<Notification[]> {
        const userId = req.user.id;
        return this.notificationService.getNotificationsByUser(userId);
    }

    @UseGuards(JwtUserGuard)
    @Post('mark-as-read')
    async markAsRead(@Req() req: AuthRequest, @Body('notificationId') notificationId: number): Promise<Notification> {
        const userId = req.user.id;
        return this.notificationService.markNotificationAsRead(userId, notificationId);
    }
}
