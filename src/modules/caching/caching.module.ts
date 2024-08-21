import { Module, Global } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService, CacheInterceptor],
  exports: [RedisService, CacheInterceptor],
})
export class CachingModule {}
