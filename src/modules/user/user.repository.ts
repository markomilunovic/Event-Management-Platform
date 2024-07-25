import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';

@Injectable()
export class UserRepository {

    async findUserById(id: number): Promise<User> {
        return User.findByPk(id);
      }

}
