import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseTicketDto {
  @ApiProperty({
    description: 'The ID of the event for which the ticket is being purchased',
    example: 1,
  })
  @IsNotEmpty({ message: 'EventId is required' })
  @IsNumber()
  eventId: number;
}
