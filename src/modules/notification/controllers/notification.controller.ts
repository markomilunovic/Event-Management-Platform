import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { JwtUserGuard } from '@modules/auth/guards/jwt-user.guard';
import { Cacheable } from '@modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from '@modules/caching/interceptors/cache.interceptor';
import { AuthRequest } from '@modules/event/interfaces/auth-request.interface';

import { Notification } from '../models/notification.model';
import { NotificationService } from '../services/notification.service';

@ApiTags('notification')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtUserGuard)
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Cacheable('getNotifications')
  @ApiOperation({ summary: 'Get all notifications for the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of notifications.',
    type: [Notification],
  })
  async getNotifications(@Req() req: AuthRequest): Promise<Notification[]> {
    const traceId = uuidv4();
    const userId = req.user.id;
    try {
      return await this.notificationService.getNotificationsByUser(userId);
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error fetching notifications for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error fetching notifications',
        traceId,
      });
    }
  }

  @Post('mark-as-read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated notification.',
    type: Notification,
  })
  async markAsRead(
    @Req() req: AuthRequest,
    @Body('notificationId') notificationId: number,
  ): Promise<Notification> {
    const traceId = uuidv4();
    const userId = req.user.id;
    try {
      return await this.notificationService.markNotificationAsRead(
        userId,
        notificationId,
      );
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
