import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Post, Req, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { AuthRequest } from 'src/modules/event/interfaces/auth-request.interface';
import { PurchaseTicketDto } from '../dtos/purchase-ticket.dto';
import { TicketResponseDto } from '../dtos/ticket-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Cacheable } from 'src/modules/caching/decorators/cache.decorator';
import { CacheInterceptor } from 'src/modules/caching/interceptors/cache.interceptor';

@UseInterceptors(CacheInterceptor)
@Controller('tickets')
export class TicketController {

    constructor(private ticketService: TicketService) {}

    @Post()
    @UseGuards(JwtUserGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async purchaseTicket(@Req() req: AuthRequest, @Body() purchaseTicketDto: PurchaseTicketDto): Promise<ResponseDto<TicketResponseDto>> {
        try {
            const userId = req.user?.id;
            const ticket = await this.ticketService.purchaseTicket(userId, purchaseTicketDto);
            return new ResponseDto(new TicketResponseDto(ticket), 'Ticket purchased successfully.');
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException('Ticket purchase failed. Please retry.');
            }
        }
    }

    @Get()
    @Cacheable('getTickets')
    @UseGuards(JwtUserGuard)
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
    @UseGuards(JwtUserGuard)
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
