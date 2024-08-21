import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
    private client: Redis;

    constructor(private configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST'),
            port: parseInt(this.configService.get<string>('REDIS_PORT'), 10),
            db: this.configService.get<number>('REDIS_DB', 0)
        });
    
        this.client.on('connect', () => {
            console.log('Redis client connected');
        });
    
        this.client.on('error', (err) => {
            console.error('Redis client connection error:', err);
        });
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    };

    async set(key: string, value: string, ttl: number = 600): Promise<'OK' | null> {
        return await this.client.set(key, value, 'EX', ttl);
    };
};
