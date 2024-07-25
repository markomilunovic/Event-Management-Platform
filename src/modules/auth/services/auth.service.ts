import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { CreateUserDto } from '../dtos/create-user.dto'; 
import { LoginUserDto } from '../dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { AccessTokenPayload, RefreshTokenPayload } from '../interfaces/token-payloads.interface';
import { AccessToken } from '../models/access-token.model'; 
import { RefreshToken } from '../models/refresh-token.model'; 

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto, profilePicture?: string): Promise<UserResponseDto> {
    const { email, password } = createUserDto;

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.authRepository.createUser({ ...createUserDto, password: hashedPassword }, profilePicture);
    return new UserResponseDto(newUser);
  }

  generateAccessToken(payload: AccessTokenPayload): string {
    const expiresIn = `${this.configService.get('ACCESS_TOKEN_EXPIRATION_DAYS')}d`;
    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn,
    });
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    const expiresIn = `${this.configService.get('REFRESH_TOKEN_EXPIRATION_DAYS')}d`;
    return this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn,
    });
  }

  async saveAccessToken(userId: number, expiresAt: Date): Promise<AccessToken> {
    return await this.authRepository.createAccessToken(userId, expiresAt);
  }

  async saveRefreshToken(accessTokenId: string, expiresAt: Date): Promise<RefreshToken> {
    return await this.authRepository.createRefreshToken(accessTokenId, expiresAt);
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = loginUserDto;
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong password');
    }

    const accessTokenExpiresAt = new Date();
    accessTokenExpiresAt.setDate(accessTokenExpiresAt.getDate() + this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_DAYS'));

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS'));

    const accessToken = await this.saveAccessToken(user.id, accessTokenExpiresAt);
    const refreshToken = await this.saveRefreshToken(accessToken.id, refreshTokenExpiresAt);

    const accessTokenPayload: AccessTokenPayload = {
      jti: accessToken.id,
      sub: user.id,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      jti: refreshToken.id,
      sub: accessToken.id,
    };

    const accessTokenString = this.generateAccessToken(accessTokenPayload);
    const refreshTokenString = this.generateRefreshToken(refreshTokenPayload);

    const userResponseDto = new UserResponseDto(user);
    return new LoginResponseDto(accessTokenString, refreshTokenString, userResponseDto);
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
