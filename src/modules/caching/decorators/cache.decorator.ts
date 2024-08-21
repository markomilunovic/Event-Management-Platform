import { SetMetadata } from '@nestjs/common';

export const Cacheable = (key: string, ttl: number = 600) =>
    SetMetadata('cache_key', { key, ttl });
