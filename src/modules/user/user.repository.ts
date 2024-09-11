import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UpdateProfileType } from './types/types';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(
    userId: number,
    updateProfileType: UpdateProfileType,
  ): Promise<void> {
    await this.userRepository.update(userId, updateProfileType);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async save(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}
