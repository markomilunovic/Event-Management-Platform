import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '@modules/event/entities/event.entity';
import { UserActivity } from '@modules/user/entities/user-activity.entity';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  async getEvent(eventId: number): Promise<Event | null> {
    return this.eventRepository.findOne({ where: { id: eventId } });
  }

  async getActivities(userId: number): Promise<UserActivity[]> {
    return this.userActivityRepository.find({ where: { userId } });
  }
}
