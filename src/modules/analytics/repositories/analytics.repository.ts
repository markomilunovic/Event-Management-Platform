import { Injectable } from '@nestjs/common';

import { Event } from 'src/modules/event/models/event.model';

@Injectable()
export class AnalyticsRepository {
  async getEvent(eventId: number): Promise<Event> {
    return await Event.findByPk(eventId);
  }
}
