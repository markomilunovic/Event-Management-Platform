import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';

import { ResponseDto } from 'src/common/dto/response.dto';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { UserActivity } from 'src/modules/user/models/user-activity.model';

import { AnalyticsService } from '../services/analytics.service';

@UseGuards(JwtUserGuard, AdminGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('event-attendance/:eventId')
  async getEventAttendance(
    @Param('eventId') eventId: number,
  ): Promise<ResponseDto<number>> {
    try {
      const eventAttendance =
        await this.analyticsService.getEventAttendance(eventId);
      return new ResponseDto(
        eventAttendance,
        `The attendance for the event is ${eventAttendance}.`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Error retrieving event attendance',
        );
      }
    }
  }

  @Get('tickets-sold/:eventId')
  async getTicketsSold(
    @Param('eventId') eventId: number,
  ): Promise<ResponseDto<number>> {
    try {
      const ticketsSold = await this.analyticsService.getTicketsSold(eventId);
      return new ResponseDto(
        ticketsSold,
        `Tickets sold for the event: ${ticketsSold}.`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Error retrieving tickets sold data',
        );
      }
    }
  }

  @Get('user-activity/:userId')
  async getUserActivity(
    @Param('userId') userId: number,
  ): Promise<ResponseDto<UserActivity[]>> {
    try {
      const activities = await this.analyticsService.getUserActivity(userId);
      return new ResponseDto(
        activities,
        `Activities for user ${userId} retrieved successfully.`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Error retrieving user activities',
        );
      }
    }
  }
}
