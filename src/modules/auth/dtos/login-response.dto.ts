import { UserResponseDto } from "./user-response.dto";

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;

  constructor(accessToken: string, refreshToken: string, user: UserResponseDto) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
  }
}
