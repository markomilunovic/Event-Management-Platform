import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { multerConfig } from 'src/config/multer.config';

import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return this.authService.register(createUserDto, profilePicture?.filename);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    return this.authService.login(loginUserDto);
  }

  @Patch('logout/:userId')
  async logout(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.authService.logout(userId);
  }
}
