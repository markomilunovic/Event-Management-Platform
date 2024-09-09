import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RedisService } from '../services/redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private redisService: RedisService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const cacheMetadata = this.reflector.get<{ key: string; ttl: number }>(
      'cache_key',
      handler,
    );
    if (!cacheMetadata) {
      return next.handle();
    }

    const { key, ttl } = cacheMetadata;
    const cachedResponse = await this.redisService.get(key);
    if (cachedResponse) {
      console.log(`Cache hit for key: ${key}`);
      return of(JSON.parse(cachedResponse));
    } else {
      console.log(`Cache miss for key: ${key}`);
      return next.handle().pipe(
        tap((response) => {
          this.redisService.set(key, JSON.stringify(response), ttl);
          console.log(`Response cached for key: ${key}`);
        }),
      );
    }
  }
}
