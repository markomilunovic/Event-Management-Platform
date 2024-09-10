import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from './models/user.model';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), LoggerModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
