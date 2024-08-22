import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './models/ticket.model';
import { Event } from '../event/models/event.model';
import { User } from '../user/models/user.model';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';
import { TicketRepository } from './repositories/ticket.repository';
import { QRCodeService } from './services/qrcode.service';
import { UserActivity } from '../user/models/user-activity.model';
import { EventModule } from '../event/event.module';

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
