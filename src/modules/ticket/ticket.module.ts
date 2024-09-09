import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { TicketController } from './controllers/ticket.controller';
import { Ticket } from './models/ticket.model';
import { TicketRepository } from './repositories/ticket.repository';
import { QRCodeService } from './services/qrcode.service';
import { TicketService } from './services/ticket.service';
import { EventModule } from '../event/event.module';
import { Event } from '../event/models/event.model';
import { UserActivity } from '../user/models/user-activity.model';
import { User } from '../user/models/user.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([Ticket, Event, User, UserActivity]),
    forwardRef(() => EventModule),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, QRCodeService],
  exports: [TicketRepository],
})
export class TicketModule {}
