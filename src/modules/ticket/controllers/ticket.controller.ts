import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ResponseDto } from '@common/dto/response.dto';
import { JwtUserGuard } from '@modules/auth/guards/jwt-user.guard';
import { Cacheable } from '@modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from '@modules/caching/interceptors/cache.interceptor';
import { AuthRequest } from '@modules/event/interfaces/auth-request.interface';

import { PurchaseTicketDto } from '../dtos/purchase-ticket.dto';
import { TicketResponseDto } from '../dtos/ticket-response.dto';
import { TicketService } from '../services/ticket.service';

@ApiTags('Tickets')
@UseGuards(JwtUserGuard)
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiOperation({ summary: 'Purchase a ticket' })
  @ApiResponse({ status: 201, description: 'Ticket purchased successfully.' })
  @ApiResponse({ status: 500, description: 'Ticket purchase failed.' })
  async purchaseTicket(
    @Req() req: AuthRequest,
    @Body() purchaseTicketDto: PurchaseTicketDto,
  ): Promise<ResponseDto<TicketResponseDto>> {
    try {
      const userId = req.user?.id;
      const ticket = await this.ticketService.purchaseTicket(
        userId,
        purchaseTicketDto,
      );
      return new ResponseDto(
        new TicketResponseDto(ticket),
        'Ticket purchased successfully.',
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Ticket purchase failed. Please retry.',
        );
      }
    }
  }

  @Get()
  @Cacheable('getTickets')
  @ApiOperation({ summary: 'Get all tickets for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve tickets.' })
  async getTickets(
    @Req() req: AuthRequest,
  ): Promise<ResponseDto<TicketResponseDto[]>> {
    try {
      const userId = req.user?.id;
      const tickets = await this.ticketService.getTicketsByUserId(userId);
      const ticketDtos = tickets.map((ticket) => new TicketResponseDto(ticket));
      return new ResponseDto(ticketDtos, 'Tickets retrieved successfully.');
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve tickets. Please retry.',
      );
    }
  }

  @Get(':id')
  @Cacheable('getTicketById')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve the ticket.' })
  async getTicketById(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<TicketResponseDto>> {
    try {
      const userId = req.user?.id;
      const ticket = await this.ticketService.getTicketById(userId, id);
      return new ResponseDto(
        new TicketResponseDto(ticket),
        'Ticket retrieved successfully.',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve the ticket. Please retry.',
      );
    }
  }
}
