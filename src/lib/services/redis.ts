'use server';

import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour
const MAX_REQUESTS_PER_HOUR = 50;

let redisClient: RedisClientType | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();
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

export const redis = redisClient;

export const teamMethods = {
  async addTeamMember(teamId: string, userId: string) {
    const redis = await getRedisClient();
    return redis.sAdd(`team:${teamId}:members`, userId);
  },

  async removeTeamMember(teamId: string, userId: string) {
    const redis = await getRedisClient();
    return redis.sRem(`team:${teamId}:members`, userId);
  },

  async getTeamMembers(teamId: string) {
    const redis = await getRedisClient();
    return redis.sMembers(`team:${teamId}:members`);
  },

  async isTeamMember(teamId: string, userId: string) {
    const redis = await getRedisClient();
    return redis.sIsMember(`team:${teamId}:members`, userId);
  }
}; 