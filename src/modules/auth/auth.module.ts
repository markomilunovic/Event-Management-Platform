import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@modules/user/entities/user.entity';

import { AuthController } from './controllers/auth.controller';
import { AccessToken } from './entities/access-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { UserActivity } from '../user/entities/user-activity.entity';
import { LoggerModule } from '@modules/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
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
    TypeOrmModule.forFeature([User, AccessToken, RefreshToken, UserActivity]),
  ],
  providers: [AuthService, AuthRepository, JwtUserStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
