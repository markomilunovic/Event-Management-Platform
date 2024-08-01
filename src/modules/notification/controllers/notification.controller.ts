import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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

}
