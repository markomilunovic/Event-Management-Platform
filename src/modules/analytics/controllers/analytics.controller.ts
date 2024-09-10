import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { INTEGER } from 'sequelize';

import { ResponseDto } from '@common/dto/response.dto';
import { AdminGuard } from '@modules/auth/guards/admin.guard';
import { JwtUserGuard } from '@modules/auth/guards/jwt-user.guard';
import { UserActivity } from '@modules/user/models/user-activity.model';

import { AnalyticsService } from '../services/analytics.service';
import { LoggerService } from '@modules/logger/logger.service';

@ApiTags('analytics')
@UseGuards(JwtUserGuard, AdminGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService,
              private readonly loggerService: LoggerService
  ) {}

  @Get('event-attendance/:eventId')
  @ApiOperation({ summary: 'Get attendance for a specific event' })
  @ApiParam({ name: 'eventId', type: INTEGER, description: 'ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved event attendance',
    type: ResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving event attendance',
  })
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
        this.loggerService.logError(error.message);
        throw new InternalServerErrorException(
          'Error retrieving event attendance',
        );
    }
  }

  @Get('tickets-sold/:eventId')
  @ApiOperation({ summary: 'Get tickets sold for a specific event' })
  @ApiParam({ name: 'eventId', type: INTEGER, description: 'ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved tickets sold data',
    type: ResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving tickets sold data',
  })
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
        this.loggerService.logError(error.message);
        throw new InternalServerErrorException(
          'Error retrieving tickets sold data',
        );
    }
  }

  @Get('user-activity/:userId')
  @ApiOperation({ summary: 'Get user activity for a specific user' })
  @ApiParam({ name: 'userId', type: INTEGER, description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user activities',
    type: ResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Error retrieving user activities' })
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
        this.loggerService.logError(error.message);
        throw new InternalServerErrorException(
          'Error retrieving user activities',
        );
    }
  }
}
