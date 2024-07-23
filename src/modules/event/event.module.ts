import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './models/event.model';

@Module({
    imports: [
        ConfigModule,
        SequelizeModule.forFeature([Event])
    ],
    controllers: [],
    providers: []
})
export class EventModule {}
