import { Controller, Get, InternalServerErrorException, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtUserGuard } from 'src/modules/auth/guards/jwt-user.guard';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('analytics')
export class AnalyticsController {

    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('event-attendance/:eventId')
    @UseGuards(JwtUserGuard, AdminGuard)
    async getEventAttendance(@Param('eventId') eventId: number): Promise<ResponseDto<number>> {
        try{
            const eventAttendance = await this.analyticsService.getEventAttendance(eventId);
            return new ResponseDto(eventAttendance, `The attendance for the event is ${eventAttendance}.`);
        } catch (error) {
            if (error instanceof NotFoundException){
                throw error;
            } else {
                throw new InternalServerErrorException('Error retrieving event attendance');
            }
        }
    }

    @Get('tickets-sold/:eventId')
    @UseGuards(JwtUserGuard, AdminGuard)
    async getTicketsSold(@Param('eventId') eventId: number): Promise<ResponseDto<number>> {
        try {
            const ticketsSold = await this.analyticsService.getTicketsSold(eventId);
            return new ResponseDto(ticketsSold, `Tickets sold for the event: ${ticketsSold}.`);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException('Error retrieving tickets sold data');
            }
        }
    }
}
