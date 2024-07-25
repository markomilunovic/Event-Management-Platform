import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './models/event.model';
import { EventController } from './controllers/event.controller';
import { EventService } from './services/event.service';
import { EventRepository } from './repositories/event.repository';

@Module({
    imports: [
        ConfigModule,
        SequelizeModule.forFeature([Event])
    ],
    controllers: [EventController],
    providers: [EventService, EventRepository]
})
export class EventModule {}
