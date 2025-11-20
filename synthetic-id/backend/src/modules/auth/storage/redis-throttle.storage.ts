import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

/**
 * Redis-based storage для ThrottlerModule.
 * Хранит счётчики запросов в Redis с TTL.
 */
@Injectable()
export class RedisThrottleStorage implements ThrottlerStorage {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    // Используем multi для атомарности операций
    const multi = this.redis.multi();
    multi.incr(key);
    multi.expire(key, Math.ceil(ttl / 1000)); // ttl в секундах
    multi.ttl(key);
    
    const results = await multi.exec();
    
    if (!results || results.length < 3) {
      throw new Error('Redis transaction failed');
    }
    
    const count = results[0][1] as number;
    const ttlRemaining = results[2][1] as number;
    const isBlocked = count > limit;
    
    return {
      totalHits: count,
      timeToExpire: ttlRemaining > 0 ? ttlRemaining * 1000 : 0,
      isBlocked,
      timeToBlockExpire: isBlocked && blockDuration > 0 ? blockDuration * 1000 : 0,
    };
  }

  async getRecord(key: string): Promise<ThrottlerStorageRecord | undefined> {
    const count = await this.redis.get(key);
    if (!count) {
      return undefined;
    }

    const ttl = await this.redis.ttl(key);
    const totalHits = parseInt(count, 10);
    
    return {
      totalHits,
      timeToExpire: ttl > 0 ? ttl * 1000 : 0,
      isBlocked: false, // Для упрощения не блокируем на уровне storage
      timeToBlockExpire: 0,
    };
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}

