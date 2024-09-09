import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event', example: 'Annual Tech Conference' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'A brief description of the event', example: 'A conference focusing on the latest in tech innovations.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The location where the event will be held', example: 'New York Convention Center' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'The category of the event', example: 'Technology' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'The date of the event', example: '2024-09-09', format: 'date' })
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ description: 'The time the event will start', example: '10:00 AM' })
  @IsString()
  @IsNotEmpty()
  time: string;
}
