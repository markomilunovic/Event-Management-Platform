import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
