import { Injectable } from '@nestjs/common';
import { PurchaseTicketType } from '../utils/types';
import { Ticket } from '../models/ticket.model';

@Injectable()
export class TicketRepository {

    async purchaseTicket(userId: number, eventId: number, qrCode: string): Promise<Ticket> {
        const ticket =  await Ticket.create({ userId, eventId, qrCode });
        return ticket;
    }
}
