import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './controllers/ticket.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketRepository } from './repositories/ticket.repository';
import { QRCodeService } from './services/qrcode.service';
import { TicketService } from './services/ticket.service';
import { EventModule } from '../event/event.module';
import { Event } from '../event/entities/event.entity';
import { UserActivity } from '../user/entities/user-activity.entity';
import { User } from '../user/entities/user.entity';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    TypeOrmModule.forFeature([Ticket, Event, User, UserActivity]),
    forwardRef(() => EventModule),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, QRCodeService],
  exports: [TicketRepository],
})
export class TicketModule {}
