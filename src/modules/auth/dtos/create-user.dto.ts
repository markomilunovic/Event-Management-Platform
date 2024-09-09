import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
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
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    required: false,
    example: 'user',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either "user" or "admin"' })
  role?: UserRole;
}
