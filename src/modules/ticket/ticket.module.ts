import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './models/ticket.model';
import { Event } from '../event/models/event.model';
import { User } from '../user/models/user.model';

@Module({
    imports: [
        ConfigModule,
        SequelizeModule.forFeature([Ticket, Event, User])
    ],
    controllers: [],
    providers: []
})
export class TicketModule {}
