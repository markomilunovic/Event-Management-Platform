import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Ticket } from 'src/modules/ticket/models/ticket.model';
import { User } from 'src/modules/user/models/user.model';

import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Event } from '../models/event.model';
import { UpdateEventType } from '../utils/types';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event) private readonly eventModel: typeof Event,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Ticket) private ticketModel: typeof Ticket
  ) { }

  async createEvent(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    return this.eventModel.create({ ...createEventDto, userId });
  }

  async findEventsByUser(userId: number): Promise<Event[]> {
    return this.eventModel.findAll({ where: { userId } });
  }

  async searchEvents(searchEventsDto: SearchEventsDto): Promise<Event[]> {
    const { keyword, location, category } = searchEventsDto;
    const whereClause: any = {};

    if (keyword) {
      whereClause.title = { [Op.like]: `%${keyword}%` };
    }
    if (location) {
      whereClause.location = location;
    }
    if (category) {
      whereClause.category = category;
    }

    return this.eventModel.findAll({ where: whereClause });
  }

  async getEvent(eventId: number): Promise<Event> {
    return this.eventModel.findByPk(eventId);
  }

  async updateEvent(eventId: number, updateEventType: UpdateEventType): Promise<void> {
    const event = await Event.findByPk(eventId);
    await event.update(updateEventType);
  }

  async deleteEvent(eventId: number): Promise<void> {
    await Event.destroy({ where: { id: eventId } });
  }

  async getUsersForEvent(eventId: number): Promise<User[]> {

    const tickets = await this.ticketModel.findAll({ where: { eventId: eventId } });

    // Ovde moze da se desi da tickets bude null, u tom slucaju dobicete runtime error
    if (!tickets?.length) {
      throw new Error('No tickets found for the given event');
    }

    const userIds = tickets.map(ticket => ticket.userId);

    // Remove duplicate userIds
    const uniqueUserIds = [...new Set(userIds)];

    // Find all users associated with these userIds
    const users = await this.userModel.findAll({ where: { id: uniqueUserIds } });

    if (!users.length) {
      throw new Error('No users found for the tickets');
    }

    return users;
  }

  async getNonApprovedEvents(): Promise<Event[]> {
    return this.eventModel.findAll({ where: { isApproved: false } });
  }

  async approveEvent(id: number): Promise<void> {
    await this.eventModel.update({ isApproved: true }, { where: { id } });
  }

  async rejectEvent(id: number): Promise<void> {
    await this.eventModel.update({ isApproved: false }, { where: { id } });
  }
}
