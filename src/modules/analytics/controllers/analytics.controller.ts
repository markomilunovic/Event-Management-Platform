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
    async getEventAttendance(@Param('eventId') eventId: number): Promise<ResponseDto<void>> {
        try{
            const eventAttendance = await this.analyticsService.getEventAttendance(eventId);
            return new ResponseDto(null, `The attendance for the event is ${eventAttendance}.`);
        } catch (error) {
            if (error instanceof NotFoundException){
                throw error;
            } else {
                throw new InternalServerErrorException('Error retrieving event attendance');
            }
        }
    }
}
