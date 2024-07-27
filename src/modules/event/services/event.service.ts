import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Event } from '../models/event.model';
import { UpdateEventType } from '../utils/types';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    return this.eventRepository.createEvent(createEventDto, userId);
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    return this.eventRepository.findEventsByUser(userId);
  }

  async searchEvents(searchEventsDto: SearchEventsDto): Promise<Event[]> {
    return this.eventRepository.searchEvents(searchEventsDto);
  }

  async getEvent(eventId: number): Promise<Event> {
    return this.eventRepository.getEvent(eventId);
  }

  async updateEvent(eventId: number, userId: number, updateEventType: UpdateEventType): Promise<void> {
    const event = this.eventRepository.getEvent(eventId);
    const eventUserId = (await event).userId;

    if (eventUserId != userId) {
      throw new UnauthorizedException('Only users who created the event can update it');
    }

    await this.eventRepository.updateEvent(eventId, updateEventType);
  }
}
