import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
