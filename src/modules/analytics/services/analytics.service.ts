import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { UserActivity } from 'src/modules/user/models/user-activity.model';

@Injectable()
export class AnalyticsService {

    constructor(
        private readonly analyticsRepository: AnalyticsRepository, 
        @InjectModel(UserActivity) private readonly userActivityModel: typeof UserActivity,
    ) {}


    async getEventAttendance(eventId: number) {
        const event = await this.analyticsRepository.getEvent(eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const eventAttendance = (await event).attendanceCount;

        return eventAttendance;
    }

    async getTicketsSold(eventId: number): Promise<number> {
        const event = await this.analyticsRepository.getEvent(eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event.ticketsSold;
    }

    async getUserActivity(userId: number): Promise<UserActivity[]> {
        const activities = await this.userActivityModel.findAll({ where: { userId } });
        
        if (!activities || activities.length === 0) {
            throw new NotFoundException(`No activities found for user with ID ${userId}`);
        }
        
        return activities;
    }
}
