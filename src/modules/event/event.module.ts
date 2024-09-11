import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventController } from './controllers/event.controller';
import { Event } from './entities/event.entity';
import { EventRepository } from './repositories/event.repository';
import { EventService } from './services/event.service';
import { Notification } from '../notification/entities/notification.entities';
import { NotificationModule } from '../notification/notification.module';
import { Ticket } from '../ticket/entities/ticket.entity';
import { TicketModule } from '../ticket/ticket.module';
import { UserActivity } from '../user/entities/user-activity.entity';
import { User } from '../user/entities/user.entity';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Event,
      Ticket,
      Notification,
      User,
      UserActivity,
    ]),
    NotificationModule,
    TicketModule,
    LoggerModule,
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventRepository],
})
export class EventModule {}
