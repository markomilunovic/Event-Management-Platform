import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';

import { Event } from '../entities/event.entity';
import { User } from '@modules/user/entities/user.entity';
import { Ticket } from '@modules/ticket/entities/ticket.entity';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { CheckInActivityType, UpdateEventType } from '../types/types';
import { UserActivity } from '@modules/user/entities/user-activity.entity';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    userId: number,
  ): Promise<Event> {
    const event = this.eventRepository.create({ ...createEventDto, userId });
    return this.eventRepository.save(event);
  }

  async findEventsByUser(userId: number): Promise<Event[]> {
    return this.eventRepository.find({ where: { userId } });
  }

  async searchEvents(searchEventsDto: SearchEventsDto): Promise<Event[]> {
    const { keyword, location, category } = searchEventsDto;
    const whereClause: any = {};

    if (keyword) {
      whereClause.title = Like(`%${keyword}%`);
    }
    if (location) {
      whereClause.location = location;
    }
    if (category) {
      whereClause.category = category;
    }

    return this.eventRepository.find({ where: whereClause });
  }

  async getEvent(eventId: number): Promise<Event> {
    return this.eventRepository.findOneBy({ id: eventId });
  }

  async updateEvent(
    eventId: number,
    updateEventType: UpdateEventType,
  ): Promise<void> {
    await this.eventRepository.update(eventId, updateEventType);
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this.eventRepository.delete(eventId);
  }

  async getUsersForEvent(eventId: number): Promise<User[]> {
    const tickets = await this.ticketRepository.find({ where: { eventId } });

    if (!tickets.length) {
      throw new Error('No tickets found for the given event');
    }

    const userIds = tickets.map((ticket) => ticket.userId);

    // Remove duplicate userIds
    const uniqueUserIds = [...new Set(userIds)];

    // Find all users associated with these userIds
    const users = await this.userRepository.findBy({ id: In(uniqueUserIds) });

    if (!users.length) {
      throw new Error('No users found for the tickets');
    }

    return users;
  }

  async getNonApprovedEvents(): Promise<Event[]> {
    return this.eventRepository.find({ where: { isApproved: false } });
  }

  async approveEvent(id: number): Promise<void> {
    await this.eventRepository.update(id, { isApproved: true });
  }

  async rejectEvent(id: number): Promise<void> {
    await this.eventRepository.update(id, { isApproved: false });
  }

  async save(event: Event): Promise<void> {
    await this.eventRepository.save(event);
  }

  async createCheckInActivity(
    checkInActivity: CheckInActivityType,
  ): Promise<void> {
    const { userId, action, timestamp, metadata } = checkInActivity;

    await this.userActivityRepository.save({
      userId: userId,
      action: action,
      timestamp: timestamp,
      metadata: metadata,
    });
  }
}
