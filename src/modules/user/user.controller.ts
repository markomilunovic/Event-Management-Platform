import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Put, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserResponseDto } from '../auth/dtos/user-response.dto';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get('profile')
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


}

