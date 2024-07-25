// user.controller.ts
import { Controller, Get, InternalServerErrorException, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserResponseDto } from '../auth/dtos/user-response.dto';
import { JwtUserGuard } from '../auth/guards/jwt-user.guard';

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

}

