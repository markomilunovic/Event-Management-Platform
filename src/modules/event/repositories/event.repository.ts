import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../models/event.model';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Op } from 'sequelize';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventType } from '../utils/types';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event) private readonly eventModel: typeof Event,
  ) {}

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
}
