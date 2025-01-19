'use server';

import { Redis } from 'ioredis';
import { MessageAnalytics } from '@/types/ai-assistant';

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour
const MAX_REQUESTS_PER_HOUR = 50;

let redisClient: Redis | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redisClient;
}

export async function checkRateLimit(userId: string): Promise<boolean> {
  const redis = await getRedisClient();
  const key = `rate_limit:${userId}`;
  
  const requests = await redis.incr(key);
  if (requests === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }
  
  return requests <= MAX_REQUESTS_PER_HOUR;
}

export async function getRateLimitInfo(userId: string) {
  const redis = await getRedisClient();
  const key = `rate_limit:${userId}`;
  
  const [requests, ttl] = await Promise.all([
    redis.get(key),
    redis.ttl(key)
  ]);
  
  return {
    remaining: Math.max(0, MAX_REQUESTS_PER_HOUR - (parseInt(requests || '0', 10))),
    reset: Date.now() + (ttl * 1000),
    limit: MAX_REQUESTS_PER_HOUR
  };
}

export async function logAnalytics(analytics: MessageAnalytics) {
  const redis = await getRedisClient();
  await redis.lpush('analytics', JSON.stringify(analytics));
} 