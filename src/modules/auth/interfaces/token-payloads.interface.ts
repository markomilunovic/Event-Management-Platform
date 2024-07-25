export interface AccessTokenPayload {
    jti: string;
    sub: number;
}
  
export interface RefreshTokenPayload {
    jti: string;
    sub: string;
}

export interface JwtPayloadType {
    userId: number;
  }
  