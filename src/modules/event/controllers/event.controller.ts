import { Controller, Post, Body, Get, Query, UseGuards, Req, UnauthorizedException, UsePipes, ValidationPipe, Param, ParseIntPipe, InternalServerErrorException, Put, Delete, UseInterceptors, NotFoundException } from '@nestjs/common';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { EventResponseDto } from '../dtos/event-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';
import { Cacheable } from 'src/modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from 'src/modules/caching/interceptors/cache.interceptor';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('events')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtUserGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ description: 'Event creation data', type: CreateEventDto })
  @ApiResponse({ status: 201, description: 'Event successfully created', type: EventResponseDto })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: AuthRequest): Promise<EventResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const event = await this.eventService.createEvent(createEventDto, userId);
    return new EventResponseDto(event);
  }

  @Get()
  @ApiOperation({ summary: 'Get events created by the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user events', type: [EventResponseDto] })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @Cacheable('getUserEvents')
  async getUserEvents(@Req() req: AuthRequest): Promise<EventResponseDto[]> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const events = await this.eventService.getUserEvents(userId);
    return events.map(event => new EventResponseDto(event));
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for events based on criteria' })
  @ApiQuery({ name: 'searchEventsDto', type: SearchEventsDto, description: 'Search criteria for events' })
  @ApiResponse({ status: 200, description: 'List of events matching the search criteria', type: [EventResponseDto] })
  @Cacheable('searchEvents')
  @Cacheable('searchEvents')
  async searchEvents(@Query() searchEventsDto: SearchEventsDto): Promise<EventResponseDto[]> {
    const events = await this.eventService.searchEvents(searchEventsDto);
    return events.map(event => new EventResponseDto(event));
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get details of a specific event' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the event' })
  @ApiResponse({ status: 200, description: 'Event details retrieved successfully', type: ResponseDto })
  @ApiResponse({ status: 500, description: 'Error retrieving event' })
  @Cacheable('getEvent')
  async getEvent(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto<EventResponseDto>> {
    try {
      const event = await this.eventService.getEvent(id);
      return new ResponseDto(new EventResponseDto(event), 'Event retrieved successfully');
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving event')
    }
  }

  @ApiOperation({ summary: 'Update an existing event' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the event to update' })
  @ApiBody({ description: 'Event update data', type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: ResponseDto })
  @ApiResponse({ status: 401, description: 'User not authenticated or unauthorized' })
  @ApiResponse({ status: 500, description: 'Error updating event' })
  @Put('/:id')
  async updateEvent(@Body() updateEventDto: UpdateEventDto, @Req() req, @Param('id', ParseIntPipe) id: number): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.eventService.updateEvent(id, userId, updateEventDto);
      return new ResponseDto(null, 'Event updated successfully');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating event')
    }
  }

  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the event to delete' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully', type: ResponseDto })
  @ApiResponse({ status: 401, description: 'User not authenticated or unauthorized' })
  @ApiResponse({ status: 500, description: 'Error deleting event' })
  @Delete('/:id')
  async deleteEvent(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.eventService.deleteEvent(id, userId);
      return new ResponseDto(null, 'Event deleted successfully');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting event')
    }
  }

  @Get('admin/events')
  @ApiOperation({ summary: 'Get all non-approved events' })
  @ApiResponse({ status: 200, description: 'List of non-approved events', type: [EventResponseDto] })
  @UseGuards(AdminGuard)
  @Cacheable('getNonApprovedEvents')
  @UseGuards(AdminGuard)
  async getNonApprovedEvents(): Promise<EventResponseDto[]> {
    const events = await this.eventService.getNonApprovedEvents();
    return events.map(event => new EventResponseDto(event));
  }

  @Put('admin/events/:id/approve')
  @ApiOperation({ summary: 'Approve an event' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the event to approve' })
  @ApiResponse({ status: 200, description: 'Event approved successfully', type: ResponseDto })
  @UseGuards(AdminGuard)
  async approveEvent(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto<void>> {
    await this.eventService.approveEvent(id);
    return new ResponseDto(null, 'Event approved successfully');
  }

  @Put('admin/events/:id/reject')
  @ApiOperation({ summary: 'Reject an event' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID of the event to reject' })
  @ApiResponse({ status: 200, description: 'Event rejected successfully', type: ResponseDto })
  @UseGuards(AdminGuard)
  async rejectEvent(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto<void>> {
    await this.eventService.rejectEvent(id);
    return new ResponseDto(null, 'Event rejected successfully');
  }

  @Post(':eventId/check-in')
  @ApiOperation({ summary: 'Check in to an event' })
  @ApiParam({ name: 'eventId', type: 'integer', description: 'ID of the event to check in to' })
  @ApiResponse({ status: 200, description: 'Check-in to the event was successful', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 401, description: 'User not authorized or already checked in' })
  @ApiResponse({ status: 500, description: 'Error checking in to the event' })
  async checkInToEvent(@Param('eventId') eventId: number, @Req() req: AuthRequest): Promise<ResponseDto<void>> {
    try{
      const userId = req.user.id;
      await this.eventService.checkInToEvent(eventId, userId);
      return new ResponseDto(null, 'Check in to event successfull')
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error checking in to the event');
      }
    }
  }

}
