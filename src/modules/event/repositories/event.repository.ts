import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../models/event.model';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Op } from 'sequelize';
import { CreateEventDto } from '../dtos/create-event.dto';

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
}
