import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from '../dtos/create-event.dto';
import { SearchEventsDto } from '../dtos/search-events.dto';
import { Event } from '../models/event.model';
import { UpdateEventType } from '../types/types';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { NotificationGateway } from 'src/modules/notification/gateway/notification.gateway';
import { TicketRepository } from 'src/modules/ticket/repositories/ticket.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository,
              private readonly notificationService: NotificationService,
              private readonly notificationGateway: NotificationGateway,
              private readonly ticketRepository: TicketRepository
  ) {}

  /**
 * Creates a new event associated with a user.
 * @param {CreateEventDto} createEventDto - The data transfer object containing event details.
 * @param {number} userId - The ID of the user creating the event.
 * @returns {Promise<Event>} A promise that resolves to the created event.
 */
  async createEvent(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    return this.eventRepository.createEvent(createEventDto, userId);
  }

  /**
 * Retrieves all events created by a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Event[]>} A promise that resolves to an array of events created by the user.
 */
  async getUserEvents(userId: number): Promise<Event[]> {
    return this.eventRepository.findEventsByUser(userId);
  }

  /**
 * Searches for events based on the specified criteria.
 * @param {SearchEventsDto} searchEventsDto - The data transfer object containing search criteria.
 * @returns {Promise<Event[]>} A promise that resolves to an array of events matching the search criteria.
 */
  async searchEvents(searchEventsDto: SearchEventsDto): Promise<Event[]> {
    return this.eventRepository.searchEvents(searchEventsDto);
  }

  /**
 * Retrieves the details of a specific event by its ID.
 * @param {number} eventId - The ID of the event.
 * @returns {Promise<Event>} A promise that resolves to the event details.
 */
  async getEvent(eventId: number): Promise<Event> {
    return this.eventRepository.getEvent(eventId);
  }

  /**
 * Updates the details of a specific event.
 * @param {number} eventId - The ID of the event to update.
 * @param {number} userId - The ID of the user requesting the update.
 * @param {UpdateEventType} updateEventType - The type of update to perform.
 * @returns {Promise<void>} A promise that resolves when the event is updated.
 * @throws {NotFoundException} If the event is not found.
 * @throws {UnauthorizedException} If the user is not authorized to update the event.
 */
  async updateEvent(eventId: number, userId: number, updateEventType: UpdateEventType): Promise<void> {
    const event = this.eventRepository.getEvent(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const eventUserId = (await event).userId;

    if (eventUserId != userId) {

      throw new UnauthorizedException('Only the user who created the event can update it.');
    }

    await this.eventRepository.updateEvent(eventId, updateEventType);

    const message = `Event "${(await event).title}" has been updated.`;
    await this.notifyUsersAboutEventUpdate(eventId, message);
    
  }

  private async notifyUsersAboutEventUpdate(eventId: number, message: string) {

    const usersToNotify = await this.eventRepository.getUsersForEvent(eventId);
    
    for (const user of usersToNotify) {
      // Create a notification record (if needed)
      const notification = await this.notificationService.createNotification(user.id, message);

      // Send real-time notification
      this.notificationGateway.notifyUsers(user.id, notification);
    }
  }

  /**
 * Deletes a specific event.
 * @param {number} eventId - The ID of the event to delete.
 * @param {number} userId - The ID of the user requesting the deletion.
 * @returns {Promise<void>} A promise that resolves when the event is deleted.
 * @throws {NotFoundException} If the event is not found.
 * @throws {UnauthorizedException} If the user is not authorized to delete the event.
 */
  async deleteEvent(eventId: number, userId: number): Promise<void> {
    const event = this.eventRepository.getEvent(eventId);
    const eventUserId = (await event).userId;

    if (eventUserId != userId) {
      throw new UnauthorizedException('Only the user who created the event can delete it.');
    }

    await this.eventRepository.deleteEvent(eventId);
  }

  /**
 * Retrieves all non-approved events.
 * @returns {Promise<Event[]>} A promise that resolves to an array of non-approved events.
 */
  async getNonApprovedEvents(): Promise<Event[]> {
    return this.eventRepository.getNonApprovedEvents();
  }

  /**
 * Approves a specific event by its ID and notifies the user.
 * @param {number} id - The ID of the event to approve.
 * @returns {Promise<void>} A promise that resolves when the event is approved.
 * @throws {NotFoundException} If the event is not found.
 */
  async approveEvent(id: number): Promise<void> {
    const event = await this.eventRepository.getEvent(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventRepository.approveEvent(id);
    await this.notificationService.createNotification(event.userId, 'Your event has been approved');

    this.notificationGateway.notifyUsers(event.userId, {
      message: 'Your event has been approved',
    });
  }

  /**
 * Rejects a specific event by its ID and notifies the user.
 * @param {number} id - The ID of the event to reject.
 * @returns {Promise<void>} A promise that resolves when the event is rejected.
 * @throws {NotFoundException} If the event is not found.
 */
  async rejectEvent(id: number): Promise<void> {
    const event = await this.eventRepository.getEvent(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventRepository.rejectEvent(id);
    await this.notificationService.createNotification(event.userId, 'Your event has been rejected');

    this.notificationGateway.notifyUsers(event.userId, {
      message: 'Your event has been rejected',
    });
  }

  /**
 * Handles user check-in to a specific event.
 * @param {number} eventId - The ID of the event.
 * @param {number} userId - The ID of the user checking in.
 * @returns {Promise<void>} A promise that resolves when the user is checked in.
 * @throws {NotFoundException} If the event is not found.
 * @throws {UnauthorizedException} If the user does not have a valid ticket or has already checked in.
 */
  async checkInToEvent(eventId: number, userId: number): Promise<void> {
    const event = await this.eventRepository.getEvent(eventId);

    if(!event) {
      throw new NotFoundException('Event Not Found');
    }

    const ticket = await this.ticketRepository.findUserTicketForEvent(userId, eventId);

    if(!ticket) {
      throw new UnauthorizedException('User does not have a valid ticket for this event');
    }

    if (ticket.checkedIn) {
      throw new UnauthorizedException('User has already checked in to this event');
    }

    ticket.checkedIn = true;
    await this.ticketRepository.save(ticket);

    event.attendanceCount += 1;
    await this.eventRepository.save(event);

    const checkInActivity = {
      userId: userId,
      action: 'check_in',
      timestamp: new Date(),
      metadata: {eventId}
    };

    await this.eventRepository.createCheckInActivity(checkInActivity);
    
  }

}
