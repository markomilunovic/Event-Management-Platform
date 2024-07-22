import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service'; 
import { AuthController } from './controllers/auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/modules/user/models/user.model';
import { AccessToken } from './models/access-token.model';
import { RefreshToken } from './models/refresh-token.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([User, AccessToken, RefreshToken]),
  ],
  providers: [AuthService, AuthRepository, JwtUserStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
