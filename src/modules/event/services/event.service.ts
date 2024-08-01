import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Event } from '../models/event.model';
import { UpdateEventType } from '../utils/types';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { NotificationGateway } from 'src/modules/notification/gateway/notification.gateway';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository,
              private readonly notificationService: NotificationService,
              private readonly notificationGateway: NotificationGateway
  ) {}

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

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const eventUserId = (await event).userId;

    if (eventUserId != userId) {

      throw new UnauthorizedException('Only the user who created the event can update it.');
    }

    await this.eventRepository.updateEvent(eventId, updateEventType);

    const message = `Event "${(await event).title}" has been updated.`;
    await this.notifyUsersAboutEventUpdate(eventId, message);
    
  }

  private async notifyUsersAboutEventUpdate(eventId: number, message: string) {

    const usersToNotify = await this.eventRepository.getUsersForEvent(eventId);
    
    for (const user of usersToNotify) {
      // Create a notification record (if needed)
      const notification = await this.notificationService.createNotification(user.id, message);

      // Send real-time notification
      this.notificationGateway.notifyUsers(user.id, notification);
    }
  }

  async deleteEvent(eventId: number, userId: number): Promise<void> {
    const event = this.eventRepository.getEvent(eventId);
    const eventUserId = (await event).userId;

    if (eventUserId != userId) {
      throw new UnauthorizedException('Only the user who created the event can delete it.');
    }

    await this.eventRepository.deleteEvent(eventId);
  }
}

