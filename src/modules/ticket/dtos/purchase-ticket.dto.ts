import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PurchaseTicketDto {
    @IsNotEmpty({ message: 'EventId is required' })
    @IsNumber()
    eventId: number;

}