import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { Event } from '../event/models/event.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Event])
],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository]
})
export class AnalyticsModule {}
