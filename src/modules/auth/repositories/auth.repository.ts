import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/modules/user/models/user.model';
import { AccessToken } from '../models/access-token.model';
import { RefreshToken } from '../models/refresh-token.model';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserActivity } from 'src/modules/user/models/user-activity.model';
import { LogInActivityType } from '../types/types';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(AccessToken) private readonly accessTokenModel: typeof AccessToken,
    @InjectModel(RefreshToken) private readonly refreshTokenModel: typeof RefreshToken,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ where: { email } });
  }

  async findUserById(id: number): Promise<User> {
    return this.userModel.findByPk(id);
  }

  async createUser(createUserDto: CreateUserDto, profilePicture?: string): Promise<User> {
    return this.userModel.create({ ...createUserDto, profilePicture });
  }

  async createAccessToken(userId: number, expiresAt: Date): Promise<AccessToken> {
    return this.accessTokenModel.create({ userId, expiresAt });
  }

  async createRefreshToken(accessTokenId: string, expiresAt: Date): Promise<RefreshToken> {
    return this.refreshTokenModel.create({ accessTokenId, expiresAt });
  }

  async findAccessTokenByUserId(userId: number): Promise<AccessToken> {
    return this.accessTokenModel.findOne({ where: { userId, isRevoked: false } });
  }

  async revokeAccessToken(accessTokenId: string): Promise<void> {
    await this.accessTokenModel.update(
      { isRevoked: true },
      { where: { id: accessTokenId } },
    );
  }

  async revokeRefreshTokenByAccessTokenId(accessTokenId: string): Promise<void> {
    await this.refreshTokenModel.update(
      { isRevoked: true },
      { where: { accessTokenId } },
    );
  }

  async createLogInActivity(userActivity: LogInActivityType): Promise<void> {
    const { userId, action, timestamp } = userActivity;

    await UserActivity.create({
      userId: userId,
      action: action,
      timestamp: timestamp
    });
  }
}
