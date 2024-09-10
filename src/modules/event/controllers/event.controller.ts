import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
  Param,
  ParseIntPipe,
  InternalServerErrorException,
  Put,
  Delete,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ResponseDto } from '@common/dto/response.dto';
import { AdminGuard } from '@modules/auth/guards/admin.guard';
import { JwtUserGuard } from '@modules/auth/guards/jwt-user.guard';
import { Cacheable } from '@modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from '@modules/caching/interceptors/cache.interceptor';

import { CreateEventDto } from '../dtos/create-event.dto';
import { EventResponseDto } from '../dtos/event-response.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { EventService } from '../services/event.service';
import { LoggerService } from '@modules/logger/logger.service';

@ApiTags('events')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtUserGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService,
              private readonly loggerService: LoggerService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ description: 'Event creation data', type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Event successfully created',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthRequest,
  ): Promise<EventResponseDto> {
    try {
      const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const event = await this.eventService.createEvent(createEventDto, userId);
    return new EventResponseDto(event);
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error creating event');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get events created by the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user events',
    type: [EventResponseDto],
  })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @Cacheable('getUserEvents')
  async getUserEvents(@Req() req: AuthRequest): Promise<EventResponseDto[]> {
    try {
      const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const events = await this.eventService.getUserEvents(userId);
    return events.map((event) => new EventResponseDto(event));
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error retrieving events');
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for events based on criteria' })
  @ApiQuery({
    name: 'searchEventsDto',
    type: SearchEventsDto,
    description: 'Search criteria for events',
  })
  @ApiResponse({
    status: 200,
    description: 'List of events matching the search criteria',
    type: [EventResponseDto],
  })
  @Cacheable('searchEvents')
  async searchEvents(
    @Query() searchEventsDto: SearchEventsDto,
  ): Promise<EventResponseDto[]> {
    try {
      const events = await this.eventService.searchEvents(searchEventsDto);
      return events.map((event) => new EventResponseDto(event));
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error retrieving events');
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get details of a specific event' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the event' })
  @ApiResponse({
    status: 200,
    description: 'Event details retrieved successfully',
    type: ResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Error retrieving event' })
  @Cacheable('getEvent')
  async getEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<EventResponseDto>> {
    try {
      const event = await this.eventService.getEvent(id);
      return new ResponseDto(
        new EventResponseDto(event),
        'Event retrieved successfully',
      );
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error retrieving event');
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'ID of the event to update',
  })
  @ApiBody({ description: 'Event update data', type: UpdateEventDto })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'User not authenticated or unauthorized',
  })
  @ApiResponse({ status: 500, description: 'Error updating event' })
  async updateEvent(
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.eventService.updateEvent(id, userId, updateEventDto);
      return new ResponseDto(null, 'Event updated successfully');
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error updating event');
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'ID of the event to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'User not authenticated or unauthorized',
  })
  @ApiResponse({ status: 500, description: 'Error deleting event' })
  async deleteEvent(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.eventService.deleteEvent(id, userId);
      return new ResponseDto(null, 'Event deleted successfully');
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error deleting event');
    }
  }

  @Get('admin/events')
  @ApiOperation({ summary: 'Get all non-approved events' })
  @ApiResponse({
    status: 200,
    description: 'List of non-approved events',
    type: [EventResponseDto],
  })
  @UseGuards(AdminGuard)
  @Cacheable('getNonApprovedEvents')
  async getNonApprovedEvents(): Promise<EventResponseDto[]> {
    try {
      const events = await this.eventService.getNonApprovedEvents();
      return events.map((event) => new EventResponseDto(event));
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error retrieving non-approved events');
    }
  }

  @Put('admin/events/:id/approve')
  @ApiOperation({ summary: 'Approve an event' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'ID of the event to approve',
  })
  @ApiResponse({
    status: 200,
    description: 'Event approved successfully',
    type: ResponseDto,
  })
  @UseGuards(AdminGuard)
  async approveEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    try {
      await this.eventService.approveEvent(id);
      return new ResponseDto(null, 'Event approved successfully');
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error approving event');
    }
  }

  @Put('admin/events/:id/reject')
  @ApiOperation({ summary: 'Reject an event' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'ID of the event to reject',
  })
  @ApiResponse({
    status: 200,
    description: 'Event rejected successfully',
    type: ResponseDto,
  })
  @UseGuards(AdminGuard)
  async rejectEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    try {
      await this.eventService.rejectEvent(id);
      return new ResponseDto(null, 'Event rejected successfully');
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error rejecting event');
    }
  }

  @Post(':eventId/check-in')
  @ApiOperation({ summary: 'Check in to an event' })
  @ApiParam({
    name: 'eventId',
    type: 'integer',
    description: 'ID of the event to check in to',
  })
  @ApiResponse({
    status: 200,
    description: 'Check-in to the event was successful',
    type: ResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({
    status: 401,
    description: 'User not authorized or already checked in',
  })
  @ApiResponse({ status: 500, description: 'Error checking in to the event' })
  async checkInToEvent(
    @Param('eventId') eventId: number,
    @Req() req: AuthRequest,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user.id;
      await this.eventService.checkInToEvent(eventId, userId);
      return new ResponseDto(null, 'Check-in to event successful');
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException(
        'Error checking in to the event',
      );
    }
  }
}
