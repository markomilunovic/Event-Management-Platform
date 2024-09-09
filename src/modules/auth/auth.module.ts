import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from 'src/modules/user/models/user.model';

import { AuthController } from './controllers/auth.controller';
import { AccessToken } from './models/access-token.model';
import { RefreshToken } from './models/refresh-token.model';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { UserActivity } from '../user/models/user-activity.model';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expTimeInDays = configService.get<number>(
          'ACCESS_TOKEN_EXP_TIME_IN_DAYS',
        );
        const expiresIn = `${expTimeInDays}d`;
        return {
          secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([User, AccessToken, RefreshToken, UserActivity]),
  ],
  providers: [AuthService, AuthRepository, JwtUserStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
