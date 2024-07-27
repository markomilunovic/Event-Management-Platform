import { Injectable } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Event } from '../models/event.model';

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
}
