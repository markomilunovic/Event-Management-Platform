export interface AccessTokenPayload {
  jti: string;
  sub: number;
}

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

export interface JwtPayload {
  jti: string;
  sub: number;
  iat: number;
  exp: number;
}
