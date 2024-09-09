import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from './user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token for the user session',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for renewing the access token',
    example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Details of the authenticated user',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  constructor(
    accessToken: string,
    refreshToken: string,
    user: UserResponseDto,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
