import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories/auth.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserRole } from '../enums/user-role.enum';
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

  /**
   * Registers a new user.
   * @param {CreateUserDto} createUserDto - The data transfer object containing user details.
   * @param {string} profilePicture - The optional profile picture URL of the user.
   * @returns  {Promise<UserResponseDto>} A promise that resolves to the registered user's response data.
   * @throws {BadRequestException} If the user already exists.
   */
  async register(createUserDto: CreateUserDto, profilePicture?: string): Promise<UserResponseDto> {
    const { email, password, role } = createUserDto;

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.authRepository.createUser(
      { ...createUserDto, password: hashedPassword, role: role || UserRole.USER }, 
      profilePicture
    );
    return new UserResponseDto(newUser);
  }

  /**
   * Generates an access token for the user.
   * @param {AccessTokenPayload} payload - The payload to encode in the access token.
   * @returns {string} The generated access token.
   */
  generateAccessToken(payload: AccessTokenPayload): string {
    const expiresIn = `${this.configService.get('ACCESS_TOKEN_EXP_TIME_IN_DAYS')}d`;
    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn,
    });
  }
  
  /**
   * Generates a refresh token for the user.
   * @param {RefreshTokenPayload} payload - The payload to encode in the refresh token.
   * @returns {string} The generated refresh token.
   */
  generateRefreshToken(payload: RefreshTokenPayload): string {
    const expiresIn = `${this.configService.get('REFRESH_TOKEN_EXP_TIME_IN_DAYS')}d`;
    return this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn,
    });
  }  

  /**
 * Saves a new access token for a specific user in the database.
 * @param {number} userId - The ID of the user.
 * @param {Date} expiresAt - The expiration date of the access token.
 * @returns {Promise<AccessToken>} A promise that resolves to the saved access token.
 */
  async saveAccessToken(userId: number, expiresAt: Date): Promise<AccessToken> {
    return await this.authRepository.createAccessToken(userId, expiresAt);
  }


  /**
 * Saves a new refresh token associated with a specific access token in the database.
 * @param {string} accessTokenId - The ID of the associated access token.
 * @param {Date} expiresAt - The expiration date of the refresh token.
 * @returns {Promise<RefreshToken>} A promise that resolves to the saved refresh token.
 */
  async saveRefreshToken(accessTokenId: string, expiresAt: Date): Promise<RefreshToken> {
    return await this.authRepository.createRefreshToken(accessTokenId, expiresAt);
  }

  /**
   * Handles user login.
   * @param {LoginUserDto} loginUserDto - The data transfer object containing login details.
   * @returns {Promise<LoginResponseDto>}  A promise that resolves to the response containing access and refresh tokens and user details.
   * @throws {NotFoundException} If the user does not exist.
   * @throws {UnauthorizedException} If the password is incorrect.
   */
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
    accessTokenExpiresAt.setDate(accessTokenExpiresAt.getDate() + this.configService.get<number>('ACCESS_TOKEN_EXP_TIME_IN_DAYS'));

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + this.configService.get<number>('REFRESH_TOKEN_EXP_TIME_IN_DAYS'));

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

    const userActivity = {
      userId: user.id,
      action: 'login',
      timestamp: new Date(),
    };
    
    await this.authRepository.createLogInActivity(userActivity);
    

    const userResponseDto = new UserResponseDto(user);
    return new LoginResponseDto(accessTokenString, refreshTokenString, userResponseDto);
  }
  
  /**
   * Logs the user out.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<void>} A promise that resolves when the user is logged out.
   * @throws {NotFoundException} If no access token is found for the user.
   */
  async logout(userId: number): Promise<void> {
    const accessToken = await this.authRepository.findAccessTokenByUserId(userId);
    if (!accessToken) {
      throw new NotFoundException('Access token not found for user');
    }

    await this.authRepository.revokeAccessToken(accessToken.id);
    await this.authRepository.revokeRefreshTokenByAccessTokenId(accessToken.id);
  }
}
