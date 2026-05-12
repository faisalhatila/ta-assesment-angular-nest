import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  readonly ratesCacheTtlSeconds: number;
  private readonly client: Redis;
  private isAvailable = false;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis(
      this.configService.getOrThrow<string>('redis.url'),
      {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      },
    );
    this.client.on('ready', () => {
      this.isAvailable = true;
    });
    this.client.on('error', (error) => {
      this.isAvailable = false;
      this.logger.warn(`Redis unavailable: ${error.message}`);
    });
    this.ratesCacheTtlSeconds = this.configService.getOrThrow<number>(
      'redis.ratesCacheTtlSeconds',
    );
  }

  async get(key: string): Promise<string | null> {
    const connected = await this.ensureConnection();
    if (!connected) {
      return null;
    }
    return this.client.get(key).catch(() => null);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const connected = await this.ensureConnection();
    if (!connected) {
      return;
    }
    if (ttlSeconds) {
      await this.client
        .set(key, value, 'EX', ttlSeconds)
        .catch(() => undefined);
      return;
    }
    await this.client.set(key, value).catch(() => undefined);
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    const connected = await this.ensureConnection();
    if (!connected) {
      return 1;
    }
    const count = await this.client.incr(key).catch(() => 1);
    if (count === 1) {
      await this.client.expire(key, ttlSeconds).catch(() => undefined);
    }
    return count;
  }

  private async ensureConnection(): Promise<boolean> {
    if (this.isAvailable) {
      return true;
    }
    try {
      if (
        this.client.status !== 'ready' &&
        this.client.status !== 'connecting'
      ) {
        await this.client.connect();
      }
      this.isAvailable = this.client.status === 'ready';
      return this.isAvailable;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }
}
