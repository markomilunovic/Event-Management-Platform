import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './models/user.model';
import { UserRepository } from './user.repository';
import { UpdateProfileType } from './utils/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

    constructor(private readonly userRepository: UserRepository) {}

    async getProfile(userId: number): Promise<User> {
        const user = await this.userRepository.findUserById(userId);
        return user;
    }

    async updateProfile(userId: number, updateProfileType: UpdateProfileType,  profilePicture?: string): Promise<void> {
        
        if (updateProfileType.password) {
            const hashedPassword = await bcrypt.hash(updateProfileType.password, 10);
            updateProfileType.password = hashedPassword;
        }

        if (profilePicture) {
            updateProfileType.profilePicture = profilePicture;
        }

        await this.userRepository.updateProfile(userId, updateProfileType);

    }

    async getUsers(): Promise<User[]> {
        const users = await this.userRepository.getUsers();
        return users;
    }

    async deactivateUser(id: number): Promise<void> {
        const user = await this.userRepository.findUserById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if(user.role = 'admin') {
            throw new BadRequestException('Cannot deactivate admin account');
        }

        user.isActive = false;
        await this.userRepository.save(user);
    }
}
