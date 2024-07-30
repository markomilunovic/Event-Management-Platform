import { Body, Controller, InternalServerErrorException, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { AuthRequest } from 'src/modules/event/interfaces/auth-request.interface';
import { PurchaseTicketDto } from '../dtos/purchase-ticket.dto';
import { TicketResponseDto } from '../dtos/ticket-response.dto';
import { ResponseDto } from 'src/common/dto/response.dto';

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
            throw new InternalServerErrorException('Ticket purchase failed. Please retry.');
        }
        
    }
}
