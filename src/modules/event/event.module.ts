import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { EventController } from './controllers/event.controller';
import { Event } from './models/event.model';
import { EventRepository } from './repositories/event.repository';
import { EventService } from './services/event.service';
import { Notification } from '../notification/models/notification.model';
import { NotificationModule } from '../notification/notification.module';
import { Ticket } from '../ticket/models/ticket.model';
import { TicketModule } from '../ticket/ticket.module';
import { UserActivity } from '../user/models/user-activity.model';
import { User } from '../user/models/user.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([
      Event,
      Ticket,
      Notification,
      User,
      UserActivity,
    ]),
    NotificationModule,
    TicketModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventRepository],
})
export class EventModule {}
