import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { AnalyticsService } from './services/analytics.service';
import { Event } from '../event/entities/event.entity';
import { UserActivity } from '../user/entities/user-activity.entity';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, UserActivity]), LoggerModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}
