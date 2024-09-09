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

import { ResponseDto } from 'src/common/dto/response.dto';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { Cacheable } from 'src/modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from 'src/modules/caching/interceptors/cache.interceptor';

import { CreateEventDto } from '../dtos/create-event.dto';
import { EventResponseDto } from '../dtos/event-response.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { EventService } from '../services/event.service';

@UseInterceptors(CacheInterceptor)
@UseGuards(JwtUserGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthRequest,
  ): Promise<EventResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const event = await this.eventService.createEvent(createEventDto, userId);
    return new EventResponseDto(event);
  }

  @Get()
  @Cacheable('getUserEvents')
  async getUserEvents(@Req() req: AuthRequest): Promise<EventResponseDto[]> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const events = await this.eventService.getUserEvents(userId);
    return events.map((event) => new EventResponseDto(event));
  }

  @Get('search')
  @Cacheable('searchEvents')
  async searchEvents(
    @Query() searchEventsDto: SearchEventsDto,
  ): Promise<EventResponseDto[]> {
    const events = await this.eventService.searchEvents(searchEventsDto);
    return events.map((event) => new EventResponseDto(event));
  }

  @Get('/:id')
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
      throw new InternalServerErrorException('Error retrieving event');
    }
  }

  @Put('/:id')
  async updateEvent(
    @Body() updateEventDto: UpdateEventDto,
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.eventService.updateEvent(id, userId, updateEventDto);
      return new ResponseDto(null, 'Event updated successfully');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating event');
    }
  }

  @Delete('/:id')
  async deleteEvent(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.eventService.deleteEvent(id, userId);
      return new ResponseDto(null, 'Event deleted successfully');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting event');
    }
  }

  @Get('admin/events')
  @Cacheable('getNonApprovedEvents')
  @UseGuards(AdminGuard)
  async getNonApprovedEvents(): Promise<EventResponseDto[]> {
    const events = await this.eventService.getNonApprovedEvents();
    return events.map((event) => new EventResponseDto(event));
  }

  @Put('admin/events/:id/approve')
  @UseGuards(AdminGuard)
  async approveEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    await this.eventService.approveEvent(id);
    return new ResponseDto(null, 'Event approved successfully');
  }

  @Put('admin/events/:id/reject')
  @UseGuards(AdminGuard)
  async rejectEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<void>> {
    await this.eventService.rejectEvent(id);
    return new ResponseDto(null, 'Event rejected successfully');
  }

  @Post(':eventId/check-in')
  async checkInToEvent(
    @Param('eventId') eventId: number,
    @Req() req: AuthRequest,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user.id;
      await this.eventService.checkInToEvent(eventId, userId);
      return new ResponseDto(null, 'Check in to event successfull');
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Error checking in to the event',
        );
      }
    }
  }
}
