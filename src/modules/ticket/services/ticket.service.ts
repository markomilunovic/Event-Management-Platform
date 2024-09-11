import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { EventRepository } from '@modules/event/repositories/event.repository';

import { QRCodeService } from './qrcode.service';
import { Ticket } from '../entities/ticket.entity';
import { TicketRepository } from '../repositories/ticket.repository';
import { PurchaseTicketType } from '../types/types';

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly qrCodeService: QRCodeService,
    private readonly eventRepository: EventRepository,
  ) {}

  /**
   * Purchases a ticket for the specified event and user.
   *
   * @param {number} userId - ID of the user purchasing the ticket.
   * @param {PurchaseTicketType} purchaseTicketType - The type of ticket being purchased.
   * @returns {Promise<Ticket>} - The purchased ticket.
   * @throws {NotFoundException} - If the event is not found.
   * @throws {InternalServerErrorException} - If ticket purchase fails.
   */
  async purchaseTicket(
    userId: number,
    purchaseTicketType: PurchaseTicketType,
  ): Promise<Ticket> {
    const traceId = uuidv4();

    try {
      const { eventId } = purchaseTicketType;
      const qrCodeData = `Event-${eventId}-User-${userId}`;
      const qrCodeFilePath =
        await this.qrCodeService.generateQRCodeAndSaveFile(qrCodeData);

      const purchaseTicketActivity = {
        userId,
        action: 'purchase_ticket',
        timestamp: new Date(),
        metadata: { eventId },
      };

      await this.ticketRepository.createPurchaseTicketActivity(
        purchaseTicketActivity,
      );

      const ticket = await this.ticketRepository.purchaseTicket(
        userId,
        eventId,
        qrCodeFilePath,
      );

      const event = await this.eventRepository.getEvent(eventId);
      if (!event) {
        throw new NotFoundException('Event Not Found');
      }

      event.ticketsSold += 1;
      await this.eventRepository.save(event);

      return ticket;
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error purchasing ticket: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Ticket purchase failed. Please retry.',
        traceId,
      });
    }
  }

  /**
   * Retrieves all tickets for a specific user.
   *
   * @param {number} userId - ID of the user whose tickets are being retrieved.
   * @returns {Promise<Ticket[]>} - List of tickets for the user.
   * @throws {InternalServerErrorException} - If ticket retrieval fails.
   */
  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    const traceId = uuidv4();

    try {
      return this.ticketRepository.findAllTicketsByUserId(userId);
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error retrieving tickets: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Failed to retrieve tickets. Please retry.',
        traceId,
      });
    }
  }

  /**
   * Retrieves a specific ticket by its ID for a specific user.
   *
   * @param {number} userId - ID of the user who owns the ticket.
   * @param {number} ticketId - ID of the ticket being retrieved.
   * @returns {Promise<Ticket>} - The requested ticket.
   * @throws {InternalServerErrorException} - If ticket retrieval fails.
   */
  async getTicketById(userId: number, ticketId: number): Promise<Ticket> {
    const traceId = uuidv4();

    try {
      return this.ticketRepository.findTicketById(userId, ticketId);
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error retrieving ticket by ID: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Failed to retrieve the ticket. Please retry.',
        traceId,
      });
    }
  }
}
