import { ApiProperty } from '@nestjs/swagger';

import { Ticket } from '../models/ticket.model';

export class TicketResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the ticket',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'The unique identifier of the user who purchased the ticket',
    example: 456,
  })
  userId: number;

  @ApiProperty({
    description: 'The ID of the event associated with the ticket',
    example: 789,
  })
  eventId: number;

  @ApiProperty({
    description: 'The QR code associated with the ticket',
    example: 'QRCODE123456',
  })
  qrCode: string;

  constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.userId = ticket.userId;
    this.eventId = ticket.eventId;
    this.qrCode = ticket.qrCode;
  }
}
