import { ApiProperty } from '@nestjs/swagger';

import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({
    description: 'The new title of the event (optional)',
    example: 'Annual Tech Conference 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The new description of the event (optional)',
    example: 'An updated description for the tech conference.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The new location of the event (optional)',
    example: 'San Francisco Convention Center',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'The new category of the event (optional)',
    example: 'Technology',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'The new date of the event (optional)',
    example: '2024-10-15',
    format: 'date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: Date;

  @ApiProperty({
    description: 'The new time of the event (optional)',
    example: '3:00 PM',
    required: false,
  })
  @IsString()
  @IsOptional()
  time?: string;
}
