import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UpdateProfileDto } from './dtos/update-profile.dto';
import { User } from './models/user.model';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Retrieves the profile of a user by their ID.
   *
   * @param userId - The ID of the user whose profile is to be retrieved.
   * @returns The user profile.
   * @throws NotFoundException if the user is not found.
   * @throws InternalServerErrorException if there is an issue retrieving the profile.
   */
  async getProfile(userId: number): Promise<User> {
    const traceId = uuidv4();
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error retrieving profile: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error retrieving user profile',
        traceId,
      });
    }
  }

  /**
   * Updates the profile of a user.
   *
   * @param userId - The ID of the user whose profile is to be updated.
   * @param updateProfileDto - The data to update the user's profile.
   * @param profilePicture - Optional URL of the profile picture to update.
   * @returns A promise that resolves when the profile has been updated.
   * @throws InternalServerErrorException if there is an issue updating the profile.
   */
  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
    profilePicture?: string,
  ): Promise<void> {
    const traceId = uuidv4();
    try {
      if (updateProfileDto.password) {
        const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
        updateProfileDto.password = hashedPassword;
      }

      if (profilePicture) {
        updateProfileDto.profilePicture = profilePicture;
      }

      await this.userRepository.updateProfile(userId, updateProfileDto);
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error updating profile: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error updating user profile',
        traceId,
      });
    }
  }

  /**
   * Retrieves all users.
   *
   * @returns A promise that resolves to an array of users.
   * @throws InternalServerErrorException if there is an issue retrieving users.
   */
  async getUsers(): Promise<User[]> {
    const traceId = uuidv4();
    try {
      return await this.userRepository.getUsers();
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error retrieving users: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException({
        message: 'Error retrieving users',
        traceId,
      });
    }
  }

  /**
   * Deactivates a user by their ID.
   *
   * @param userId - The ID of the user to be deactivated.
   * @returns A promise that resolves when the user has been deactivated.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException if the user is an admin.
   * @throws InternalServerErrorException if there is an issue deactivating the user.
   */
  async deactivateUser(userId: number): Promise<void> {
    const traceId = uuidv4();
    try {
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === 'admin') {
        throw new BadRequestException('Cannot deactivate admin account');
      }

      user.isActive = false;
      await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        `TraceId: ${traceId} - Error deactivating user: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException({
          message: 'Error deactivating user',
          traceId,
        });
      }
    }
  }
}
