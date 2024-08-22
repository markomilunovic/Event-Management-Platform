import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { Event } from '../event/models/event.model';
import { UserActivity } from '../user/models/user-activity.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Event, UserActivity])
],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository]
})
export class AnalyticsModule {}
