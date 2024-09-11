import {
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  ParseIntPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { multerConfig } from 'config/multer.config';

import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '@modules/logger/logger.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ description: 'User registration data', type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserResponseDto> {
    try {
      return this.authService.register(createUserDto, profilePicture?.filename);
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('Error registering user');
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ description: 'User login data', type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid credentials',
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    try {
      return this.authService.login(loginUserDto);
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('User login error');
    }
  }

  @Patch('logout/:userId')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiParam({ name: 'userId', type: 'integer', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async logout(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    try {
      return this.authService.logout(userId);
    } catch (error) {
      this.loggerService.logError(error.message);
      throw new InternalServerErrorException('User logout error');
    }
  }
}
