import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserActivity } from '@modules/user/entities/user-activity.entity';
import { User } from '@modules/user/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AccessToken } from '../entities/access-token.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LogInActivityType } from '../types/types';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AccessToken)
    private readonly accessTokenRepository: Repository<AccessToken>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(
    createUserDto: CreateUserDto,
    profilePicture?: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      profilePicture,
    });
    return this.userRepository.save(user);
  }

  async createAccessToken(
    userId: number,
    expiresAt: Date,
  ): Promise<AccessToken> {
    const accessToken = this.accessTokenRepository.create({
      userId,
      expiresAt,
    });
    return this.accessTokenRepository.save(accessToken);
  }

  async createRefreshToken(
    accessTokenId: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create({
      accessTokenId,
      expiresAt,
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async findAccessTokenByUserId(userId: number): Promise<AccessToken | null> {
    return this.accessTokenRepository.findOne({
      where: { userId, isRevoked: false },
    });
  }

  async revokeAccessToken(accessTokenId: string): Promise<void> {
    await this.accessTokenRepository.update(
      { id: accessTokenId },
      { isRevoked: true },
    );
  }

  async revokeRefreshTokenByAccessTokenId(
    accessTokenId: string,
  ): Promise<void> {
    await this.refreshTokenRepository.update(
      { accessTokenId },
      { isRevoked: true },
    );
  }

  async createLogInActivity(userActivity: LogInActivityType): Promise<void> {
    const { userId, action, timestamp } = userActivity;
    await this.userActivityRepository.save({
      userId,
      action,
      timestamp,
    });
  }
}
