import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { User } from './models/user.model';
import { UpdateProfileType } from './types/types';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Retrieves the profile of a user by their ID.
   * @param userId - The ID of the user whose profile is to be retrieved.
   * @returns The user profile.
   * @throws NotFoundException if the user is not found.
   */
  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Updates the profile of a user.
   * @param userId - The ID of the user whose profile is to be updated.
   * @param updateProfileType - The data to update the user's profile.
   * @param profilePicture - Optional URL of the profile picture to update.
   * @returns A promise that resolves when the profile has been updated.
   */
  async updateProfile(
    userId: number,
    updateProfileType: UpdateProfileType,
    profilePicture?: string,
  ): Promise<void> {
    if (updateProfileType.password) {
      const hashedPassword = await bcrypt.hash(updateProfileType.password, 10);
      updateProfileType.password = hashedPassword;
    }

    if (profilePicture) {
      updateProfileType.profilePicture = profilePicture;
    }

    await this.userRepository.updateProfile(userId, updateProfileType);
  }

  /**
   * Retrieves all users.
   * @returns A promise that resolves to an array of users.
   */
  async getUsers(): Promise<User[]> {
    return await this.userRepository.getUsers();
  }

  /**
   * Deactivates a user by their ID.
   * @param id - The ID of the user to be deactivated.
   * @returns A promise that resolves when the user has been deactivated.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the user is an admin.
   */
  async deactivateUser(id: number): Promise<void> {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      throw new BadRequestException('Cannot deactivate admin account');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }
}
