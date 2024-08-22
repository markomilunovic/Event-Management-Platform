import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './models/event.model';
import { EventController } from './controllers/event.controller';
import { EventService } from './services/event.service';
import { EventRepository } from './repositories/event.repository';
import { NotificationModule } from '../notification/notification.module';
import { Ticket } from '../ticket/models/ticket.model';
import { Notification } from '../notification/models/notification.model';
import { User } from '../user/models/user.model';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([Event, Ticket, Notification, User]),
    NotificationModule,
    forwardRef(() => TicketModule),
  ],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventRepository],
})
export class EventModule {}
