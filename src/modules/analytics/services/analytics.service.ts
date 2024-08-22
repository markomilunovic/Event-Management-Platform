import { Injectable, NotFoundException } from '@nestjs/common';
import { AnalyticsRepository } from '../repositories/analytics.repository';

@Injectable()
export class AnalyticsService {

    constructor(private readonly analyticsRepository: AnalyticsRepository) {}


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
}
