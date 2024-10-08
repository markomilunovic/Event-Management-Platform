import { BadRequestException, Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, ParseIntPipe, Put, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserResponseDto } from '../auth/dtos/user-response.dto';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Cacheable } from '../caching/decorators/cache.decorator';
import { CacheInterceptor } from '../caching/interceptors/cache.interceptor';

@UseInterceptors(CacheInterceptor)
@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get('profile')
    @Cacheable('getProfile')
    @UseGuards(JwtUserGuard)
    async getProfile(@Req() req): Promise<ResponseDto<UserResponseDto>> {
        try {

            const userId = req.user?.id;

            const userProfile = await this.userService.getProfile(userId);
        
            if (!userProfile) {
                throw new NotFoundException('User not found');
            }

            return new ResponseDto(new UserResponseDto(userProfile), 'User profile retrieved successfully');
        } catch (error) {
            throw new InternalServerErrorException('Error retrieving user profile');
        }
    }

    @Put('profile')
    @UseGuards(JwtUserGuard)
    @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto, @UploadedFile() profilePicture: Express.Multer.File): Promise<ResponseDto<void>> {
        try {

            const userId = req.user?.id;
            await this.userService.updateProfile(userId, updateProfileDto, profilePicture?.filename);

            return new ResponseDto(null, 'Profile updated successfully');
        } catch (error) {
            throw new InternalServerErrorException('Error updating user profile');
        }
    }

    @Get('admin/users')
    @Cacheable('getUsers')
    @UseGuards(JwtUserGuard, AdminGuard)
    async getUsers(): Promise<ResponseDto<UserResponseDto[]>> {
        try {
            const users = await this.userService.getUsers();
            const userResponseDtos = users.map(user => new UserResponseDto(user));
            return new ResponseDto(userResponseDtos, 'Users retrieved successfully');
        } catch (error) {
            throw new InternalServerErrorException('Error rettrieving users')
        }
    }

    @Put('admin/users/:id/deactivate')
    @UseGuards(JwtUserGuard, AdminGuard)
    async deactivateUser(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto<null>> {
        try {
            await this.userService.deactivateUser(id);
            return new ResponseDto(null, 'User deactivated successfully');
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            } else {
                throw new InternalServerErrorException('Error deactivating user');
            }
        }
    }

}

