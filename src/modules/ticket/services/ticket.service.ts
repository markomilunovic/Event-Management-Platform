import { Injectable } from '@nestjs/common';
import { TicketRepository } from '../repositories/ticket.repository';
import { PurchaseTicketType } from '../utils/types';
import { Ticket } from '../models/ticket.model';
import { QRCodeService } from './qrcode.service';

@Injectable()
export class TicketService {

    constructor(
        private ticketRepository: TicketRepository,
        private qrCodeService: QRCodeService
    ) {}

    async purchaseTicket(userId: number, purchaseTicketType: PurchaseTicketType): Promise<Ticket> {
        const { eventId } = purchaseTicketType;
        const qrCodeData = `Event-${eventId}-User-${userId}`;
        const qrCodeFilePath = await this.qrCodeService.generateQRCodeAndSaveFile(qrCodeData);
        const ticket = await this.ticketRepository.purchaseTicket(userId, eventId, qrCodeFilePath);
        return ticket;
    }

    async getTicketsByUserId(userId: number): Promise<Ticket[]> {
        return this.ticketRepository.findAllTicketsByUserId(userId);
    }

    async getTicketById(userId: number, ticketId: number): Promise<Ticket> {
        return this.ticketRepository.findTicketById(userId, ticketId);
    }
}
