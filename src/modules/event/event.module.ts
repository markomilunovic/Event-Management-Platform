import { Module } from '@nestjs/common';
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
import { RedisService } from '../caching/services/redis.service';

@Module({
    imports: [
        ConfigModule,
        SequelizeModule.forFeature([Event, Ticket, Notification, User]),
        NotificationModule
    ],
    controllers: [EventController],
    providers: [EventService, EventRepository]
})
export class EventModule {}
