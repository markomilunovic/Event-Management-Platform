import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CacheInterceptor } from './interceptors/cache.interceptor';
import { RedisService } from './services/redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService, CacheInterceptor],
  exports: [RedisService, CacheInterceptor],
})
export class CachingModule {}
