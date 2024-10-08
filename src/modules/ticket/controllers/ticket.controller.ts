import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ResponseDto } from 'src/common/dto/response.dto';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { Cacheable } from 'src/modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from 'src/modules/caching/interceptors/cache.interceptor';
import { AuthRequest } from 'src/modules/event/interfaces/auth-request.interface';

import { PurchaseTicketDto } from '../dtos/purchase-ticket.dto';
import { TicketResponseDto } from '../dtos/ticket-response.dto';
import { TicketService } from '../services/ticket.service';

@UseInterceptors(CacheInterceptor)
@UseGuards(JwtUserGuard)
@Controller('tickets')
export class TicketController {

    constructor(private ticketService: TicketService) { }

    // Mozemo da stavimo guard na ceo controller obzirom na to da su nam sve rute zasticene
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async purchaseTicket(@Req() req: AuthRequest, @Body() purchaseTicketDto: PurchaseTicketDto): Promise<ResponseDto<TicketResponseDto>> {
        try {
            const userId = req.user?.id;
            const ticket = await this.ticketService.purchaseTicket(userId, purchaseTicketDto);
            return new ResponseDto(new TicketResponseDto(ticket), 'Ticket purchased successfully.');
        } catch (error) {
            throw new InternalServerErrorException('Ticket purchase failed. Please retry.');
        }
    }

    @Get()
    @Cacheable('getTickets')
    async getTickets(@Req() req: AuthRequest): Promise<ResponseDto<TicketResponseDto[]>> {
        try {
            const userId = req.user?.id;
            const tickets = await this.ticketService.getTicketsByUserId(userId);
            const ticketDtos = tickets.map(ticket => new TicketResponseDto(ticket));
            return new ResponseDto(ticketDtos, 'Tickets retrieved successfully.');
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve tickets. Please retry.');
        }
    }

    @Get(':id')
    @Cacheable('getTicketById')
    async getTicketById(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number): Promise<ResponseDto<TicketResponseDto>> {
        try {
            const userId = req.user?.id;
            const ticket = await this.ticketService.getTicketById(userId, id);
            return new ResponseDto(new TicketResponseDto(ticket), 'Ticket retrieved successfully.');
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve the ticket. Please retry.');
        }
    }
}
