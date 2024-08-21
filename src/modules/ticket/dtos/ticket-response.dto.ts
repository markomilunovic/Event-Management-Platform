import { Ticket } from "../models/ticket.model";

export class TicketResponseDto {
    id: number;
    userId: number;
    eventId: number;
    qrCode: string;

    constructor(ticket: Ticket) {
        this.id = ticket.id;
        this.userId = ticket.userId;
        this.eventId = ticket.eventId;
        this.qrCode = ticket.qrCode;
    }
}