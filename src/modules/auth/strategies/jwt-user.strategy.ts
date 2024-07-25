import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { JwtPayloadType } from '../interfaces/token-payloads.interface';
import { User } from 'src/modules/user/models/user.model'; 

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayloadType): Promise<User> {
    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
