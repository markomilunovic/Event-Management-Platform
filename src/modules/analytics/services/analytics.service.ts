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


    /**
     * Retrieves the attendance count for a specific event by its ID.
     * @param {number} eventId - The ID of the event.
     * @returns {Promise<number>} A promise that resolves to the attendance count for the event.
     * @throws {NotFoundException} If the event is not found.
     */
    async getEventAttendance(eventId: number) {
        const event = await this.analyticsRepository.getEvent(eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const eventAttendance = (await event).attendanceCount;

        return eventAttendance;
    }

    /**
     * Retrieves the number of tickets sold for a specific event by its ID.
     * @param {number} eventId - The ID of the event.
     * @returns {Promise<number>} A promise that resolves to the number of tickets sold for the event.
     * @throws {NotFoundException} If the event is not found.
     */
    async getTicketsSold(eventId: number): Promise<number> {
        const event = await this.analyticsRepository.getEvent(eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event.ticketsSold;
    }

    /**
     * Retrieves all user activities for a specific user by their ID.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<UserActivity[]>} A promise that resolves to an array of user activities.
     * @throws {NotFoundException} If no activities are found for the user.
     */
    async getUserActivity(userId: number): Promise<UserActivity[]> {
        const activities = await this.userActivityModel.findAll({ where: { userId } });
        
        if (!activities || activities.length === 0) {
            throw new NotFoundException(`No activities found for user with ID ${userId}`);
        }
        
        return activities;
    }
}
