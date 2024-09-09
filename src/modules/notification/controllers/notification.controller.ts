import { Controller, Get, Post, Req, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { AuthRequest } from 'src/modules/event/interfaces/auth-request.interface';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';
import { Cacheable } from 'src/modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from 'src/modules/caching/interceptors/cache.interceptor';

@ApiTags('notification')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtUserGuard)
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Cacheable('getNotifications')
  @ApiOperation({ summary: 'Get all notifications for the user' })
  @ApiResponse({ status: 200, description: 'Returns an array of notifications.', type: [Notification] })
  async getNotifications(@Req() req: AuthRequest): Promise<Notification[]> {
    const userId = req.user.id;
    return this.notificationService.getNotificationsByUser(userId);
  }

  @Post('mark-as-read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Returns the updated notification.', type: Notification })
  async markAsRead(@Req() req: AuthRequest, @Body('notificationId') notificationId: number): Promise<Notification> {
    const userId = req.user.id;
    return this.notificationService.markNotificationAsRead(userId, notificationId);
  }
}
