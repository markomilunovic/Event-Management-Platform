import { Injectable } from '@nestjs/common';
import { Ticket } from '../models/ticket.model';

@Injectable()
export class TicketRepository {

    async purchaseTicket(userId: number, eventId: number, qrCode: string): Promise<Ticket> {
        const ticket = await Ticket.create({ userId, eventId, qrCode });
        return ticket;
    }

    async findAllTicketsByUserId(userId: number): Promise<Ticket[]> {
        return Ticket.findAll({ where: { userId } });
    }

    async findTicketById(userId: number, ticketId: number): Promise<Ticket> {
        return Ticket.findOne({ where: { id: ticketId, userId } });
    }
}
