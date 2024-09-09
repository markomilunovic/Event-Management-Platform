import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { PurchaseTicketType } from '../types/types';
import { Ticket } from '../models/ticket.model';
import { QRCodeService } from './qrcode.service';
import { EventRepository } from 'src/modules/event/repositories/event.repository';

@Injectable()
export class TicketService {

    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly qrCodeService: QRCodeService,
        private readonly eventRepository: EventRepository
    ) {}

    /**
     * Purchases a ticket for a given event and generates a QR code for it.
     * @param {number} userId - The ID of the user purchasing the ticket.
     * @param {PurchaseTicketType} purchaseTicketType - The ticket purchase details.
     * @returns {Promise<Ticket>} The purchased ticket.
     * @throws {NotFoundException} If the event is not found.
     */
    async purchaseTicket(userId: number, purchaseTicketType: PurchaseTicketType): Promise<Ticket> {
        const { eventId } = purchaseTicketType;
        const qrCodeData = `Event-${eventId}-User-${userId}`;
        const qrCodeFilePath = await this.qrCodeService.generateQRCodeAndSaveFile(qrCodeData);

        const purchaseTicketActivity = {
            userId,
            action: 'purchase_ticket',
            timestamp: new Date(),
            metadata: { eventId }
        };

        await this.ticketRepository.createPurchaseTicketActivity(purchaseTicketActivity);

        const ticket = await this.ticketRepository.purchaseTicket(userId, eventId, qrCodeFilePath);

        const event = await this.eventRepository.getEvent(eventId);
        if (!event) {
            throw new NotFoundException('Event Not Found');
        }

        event.ticketsSold += 1;
        await this.eventRepository.save(event);

        return ticket;
    }

    /**
     * Retrieves all tickets for a given user.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<Ticket[]>} A list of tickets for the user.
     */
    async getTicketsByUserId(userId: number): Promise<Ticket[]> {
        return this.ticketRepository.findAllTicketsByUserId(userId);
    }

    /**
     * Retrieves a specific ticket by its ID and the user's ID.
     * @param {number} userId - The ID of the user.
     * @param {number} ticketId - The ID of the ticket.
     * @returns {Promise<Ticket>} The ticket details.
     */
    async getTicketById(userId: number, ticketId: number): Promise<Ticket> {
        return this.ticketRepository.findTicketById(userId, ticketId);
    }
}
