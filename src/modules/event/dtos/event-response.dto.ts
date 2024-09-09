import { ApiProperty } from '@nestjs/swagger';
import { Event } from 'src/modules/event/models/event.model';

export class EventResponseDto {
  @ApiProperty({ description: 'The unique identifier of the event', example: 1 })
  id: number;

  @ApiProperty({ description: 'The title of the event', example: 'Annual Tech Conference' })
  title: string;

  @ApiProperty({ description: 'A brief description of the event', example: 'A conference focusing on the latest in tech innovations.' })
  description: string;

  @ApiProperty({ description: 'The location where the event will be held', example: 'New York Convention Center' })
  location: string;

  @ApiProperty({ description: 'The category of the event', example: 'Technology' })
  category: string;

  @ApiProperty({ description: 'The date of the event', example: '2024-09-09', format: 'date' })
  date: Date;

  @ApiProperty({ description: 'The time the event will start', example: '10:00 AM' })
  time: string;

  constructor(event: Event) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.location = event.location;
    this.category = event.category;
    this.date = event.date;
    this.time = event.time;
  }
}
