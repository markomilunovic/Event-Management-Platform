import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    constructor(private readonly userRepository: UserRepository) {}

    async getProfile(userId: number): Promise<User> {
        const user = await this.userRepository.findUserById(userId);
        return user;
    }
}
