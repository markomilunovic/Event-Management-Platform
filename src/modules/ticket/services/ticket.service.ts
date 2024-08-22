import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { PurchaseTicketType } from '../utils/types';
import { Ticket } from '../models/ticket.model';
import { QRCodeService } from './qrcode.service';
import { EventRepository } from 'src/modules/event/repositories/event.repository';

@Injectable()
export class TicketService {

    constructor(
        private ticketRepository: TicketRepository,
        private qrCodeService: QRCodeService,
        private eventRepository: EventRepository
    ) {}

    async purchaseTicket(userId: number, purchaseTicketType: PurchaseTicketType): Promise<Ticket> {
        const { eventId } = purchaseTicketType;
        const qrCodeData = `Event-${eventId}-User-${userId}`;
        const qrCodeFilePath = await this.qrCodeService.generateQRCodeAndSaveFile(qrCodeData);

        const purchaseTicketActivity = {
            userId: userId,
            action: 'purchase_ticket',
            timestamp: new Date(),
            metadata: {eventId}
        };

        await this.ticketRepository.createPurchaseTicketActivity(purchaseTicketActivity);


        const ticket = await this.ticketRepository.purchaseTicket(userId, eventId, qrCodeFilePath);

        const event = await this.eventRepository.getEvent(eventId);
        if (!event) {
            throw new NotFoundException('Event Not Found')
        }

        event.ticketsSold += 1;
        await this.eventRepository.save(event);

        return ticket;
    }

    async getTicketsByUserId(userId: number): Promise<Ticket[]> {
        return this.ticketRepository.findAllTicketsByUserId(userId);
    }

    async getTicketById(userId: number, ticketId: number): Promise<Ticket> {
        return this.ticketRepository.findTicketById(userId, ticketId);
    }
}
