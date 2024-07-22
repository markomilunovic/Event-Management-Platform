import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto, profilePicture?: string): Promise<UserResponseDto> {
    const { email, password } = createUserDto;

    const user = await this.authRepository.findUserByEmail(email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.authRepository.createUser({ ...createUserDto, password: hashedPassword }, profilePicture);
    return new UserResponseDto(newUser);
  }

  createAccessToken(accessTokenEncode: any): string {
    const expiresIn = `${this.configService.get('ACCESS_TOKEN_EXP_TIME_IN_DAYS')}d`;
    return this.jwtService.sign({ accessTokenEncode }, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn,
    });
  }

  createRefreshToken(refreshTokenEncode: any): string {
    const expiresIn = `${this.configService.get('REFRESH_TOKEN_EXP_TIME_IN_DAYS')}d`;
    return this.jwtService.sign({ refreshTokenEncode }, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn,
    });
  }

  async createAccessTokenInDb(userId: number, expiresAt: Date): Promise<any> {
    const token = await this.authRepository.createAccessToken(userId, expiresAt);
    return token;
  }

  async createRefreshTokenInDb(accessTokenId: string, expiresAt: Date): Promise<any> {
    const token = await this.authRepository.createRefreshToken(accessTokenId, expiresAt);
    return token;
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = loginUserDto;
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong password');
    }

    const accessTokenExpiresAt = new Date();
    accessTokenExpiresAt.setDate(accessTokenExpiresAt.getDate() + this.configService.get<number>('ACCESS_TOKEN_EXP_TIME_IN_DAYS'));

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + this.configService.get<number>('REFRESH_TOKEN_EXP_TIME_IN_DAYS'));

    const accessToken = await this.createAccessTokenInDb(user.id, accessTokenExpiresAt);
    const refreshToken = await this.createRefreshTokenInDb(accessToken.id, refreshTokenExpiresAt);

    const accessTokenEncode = {
      jti: accessToken.id,
      sub: user.id,
    };

    const refreshTokenEncode = {
      jti: refreshToken.id,
      sub: accessToken.id,
    };

    const accessTokenToken = this.createAccessToken(accessTokenEncode);
    const refreshTokenToken = this.createRefreshToken(refreshTokenEncode);

    const userResponseDto = new UserResponseDto(user);
    return new LoginResponseDto(accessTokenToken, refreshTokenToken, userResponseDto);
  }

  async logout(userId: number): Promise<void> {
    const accessToken = await this.authRepository.findAccessTokenByUserId(userId);
    if (!accessToken) {
      throw new NotFoundException('Access token not found for user');
    }
    
    await this.authRepository.revokeAccessToken(accessToken.id);

    await this.authRepository.revokeRefreshTokenByAccessTokenId(accessToken.id);
  }
}
