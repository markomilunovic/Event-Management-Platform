import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ResponseDto } from '@common/dto/response.dto';
import { multerConfig } from 'config/multer.config';

import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UserService } from './user.service';
import { UserResponseDto } from '../auth/dtos/user-response.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { Cacheable } from '../caching/decorators/cache.decorator';
import { CacheInterceptor } from '../caching/interceptors/cache.interceptor';

@ApiTags('Users')
@UseGuards(JwtUserGuard)
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Cacheable('getProfile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getProfile(@Req() req): Promise<ResponseDto<UserResponseDto>> {
    try {
      const userId = req.user?.id;
      const userProfile = await this.userService.getProfile(userId);

      if (!userProfile) {
        throw new NotFoundException('User not found');
      }

      return new ResponseDto(
        new UserResponseDto(userProfile),
        'User profile retrieved successfully',
      );
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user profile');
    }
  }

  @Put('profile')
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateProfile(
    @Req() req,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<ResponseDto<void>> {
    try {
      const userId = req.user?.id;
      await this.userService.updateProfile(
        userId,
        updateProfileDto,
        profilePicture?.filename,
      );

      return new ResponseDto(null, 'Profile updated successfully');
    } catch (error) {
      throw new InternalServerErrorException('Error updating user profile');
    }
  }

  @Get('admin/users')
  @UseGuards(AdminGuard)
  @Cacheable('getUsers')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUsers(): Promise<ResponseDto<UserResponseDto[]>> {
    try {
      const users = await this.userService.getUsers();
      const userResponseDtos = users.map((user) => new UserResponseDto(user));
      return new ResponseDto(userResponseDtos, 'Users retrieved successfully');
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving users');
    }
  }

  @Put('admin/users/:id/deactivate')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deactivateUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<null>> {
    try {
      await this.userService.deactivateUser(id);
      return new ResponseDto(null, 'User deactivated successfully');
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException('Error deactivating user');
      }
    }
  }
}
