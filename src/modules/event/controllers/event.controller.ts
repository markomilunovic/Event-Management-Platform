import { Controller, Post, Body, Get, Query, UseGuards, Req, UnauthorizedException, UsePipes, ValidationPipe, Param, ParseIntPipe, InternalServerErrorException } from '@nestjs/common';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { AuthRequest } from '../interfaces/auth-request.interface';
import { EventResponseDto } from '../dtos/event-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtUserGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req: AuthRequest): Promise<EventResponseDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const event = await this.eventService.createEvent(createEventDto, userId);
    return new EventResponseDto(event);
  }

  @UseGuards(JwtUserGuard)
  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async getUserEvents(@Req() req: AuthRequest): Promise<EventResponseDto[]> {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    const events = await this.eventService.getUserEvents(userId);
    return events.map(event => new EventResponseDto(event));
  }

  @Get('search')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async searchEvents(@Query() searchEventsDto: SearchEventsDto): Promise<EventResponseDto[]> {
    const events = await this.eventService.searchEvents(searchEventsDto);
    return events.map(event => new EventResponseDto(event));
  }

  @Get('/:id')
  async getEvent(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto<EventResponseDto>> {
    try {
      const event = await this.eventService.getEvent(id);
      return new ResponseDto(new EventResponseDto(event), 'Event retrieved successfully');
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving event')
    }
  }
}
