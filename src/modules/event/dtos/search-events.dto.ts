import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class SearchEventsDto {
  @ApiProperty({
    description:
      'A keyword to search for in event titles or descriptions (optional)',
    example: 'conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description: 'The location to filter events by (optional)',
    example: 'New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'The category to filter events by (optional)',
    example: 'Technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;
}
