import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { UpdateProfileType } from './utils/types';

@Injectable()
export class UserRepository {


  async findUserById(id: number): Promise<User> {
      return User.findByPk(id);
    }

    async updateProfile(userId: number, updateProfileType: UpdateProfileType): Promise<void> {

      const user = await User.findByPk(userId);

      await user.update(updateProfileType)
    }

    async getUsers(): Promise<User[]> {
      return User.findAll();
    }

}
