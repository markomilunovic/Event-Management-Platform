import { Body, Controller, Patch, Post, UploadedFile, UseInterceptors, UsePipes, ValidationPipe, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dtos/create-user.dto'; 
import { LoginUserDto } from '../dtos/login-user.dto'; 
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { UserResponseDto } from '../dtos/user-response.dto'; 
import { LoginResponseDto } from '../dtos/login-response.dto'; 
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  @ApiOperation({ summary: 'Register a new' })
  @ApiBody({ description: 'User registration data', type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: UserResponseDto})
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return this.authService.register(createUserDto, profilePicture?.filename);
  }
  
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ description: 'User login data', type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid credentials' })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    return this.authService.login(loginUserDto);
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiParam({ name: 'userId', type: 'integer', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch('logout/:userId')
  async logout(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return this.authService.logout(userId);
  }
}
