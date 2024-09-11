import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from '@modules/user/entities/user-activity.entity';
import { Ticket } from '../entities/ticket.entity';
import { PurchaseTicketActivityType } from '../types/types';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  async purchaseTicket(
    userId: number,
    eventId: number,
    qrCode: string,
  ): Promise<Ticket> {
    const ticket = this.ticketRepository.create({ userId, eventId, qrCode });
    return this.ticketRepository.save(ticket);
  }

  async findAllTicketsByUserId(userId: number): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { userId } });
  }

  async findTicketById(userId: number, ticketId: number): Promise<Ticket | null> {
    return this.ticketRepository.findOne({ where: { id: ticketId, userId } });
  }

  async findUserTicketForEvent(
    userId: number,
    eventId: number,
  ): Promise<Ticket | null> {
    return this.ticketRepository.findOne({ where: { eventId, userId } });
  }

  async save(ticket: Ticket): Promise<void> {
    await this.ticketRepository.save(ticket);
  }

  async createPurchaseTicketActivity(
    purchaseTicketActivity: PurchaseTicketActivityType,
  ): Promise<void> {
    const { userId, action, timestamp, metadata } = purchaseTicketActivity;
    const activity = this.userActivityRepository.create({
      userId,
      action,
      timestamp,
      metadata,
    });
    await this.userActivityRepository.save(activity);
  }
}
