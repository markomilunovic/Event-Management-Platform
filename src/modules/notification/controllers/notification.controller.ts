import { Controller, Get, Post, Req, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { AuthRequest } from 'src/modules/event/interfaces/auth-request.interface';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';
import { Cacheable } from 'src/modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from 'src/modules/caching/interceptors/cache.interceptor';

@UseInterceptors(CacheInterceptor)
@Controller('notification')
export class NotificationController {

    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @UseGuards(JwtUserGuard)
    @Cacheable('getNotifications')
    async getNotifications(@Req() req: AuthRequest): Promise<Notification[]> {
        const userId = req.user.id;
        return this.notificationService.getNotificationsByUser(userId);
    }

    @Post('mark-as-read')
    @UseGuards(JwtUserGuard)
    async markAsRead(@Req() req: AuthRequest, @Body('notificationId') notificationId: number): Promise<Notification> {
        const userId = req.user.id;
        return this.notificationService.markNotificationAsRead(userId, notificationId);
    }
}
