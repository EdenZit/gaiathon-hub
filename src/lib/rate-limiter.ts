import { createClient } from 'redis';

export const RATE_LIMIT_WINDOW = 60; // 1 minute
export const MAX_REQUESTS = 20; // requests per window

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    await redisClient.connect();
  }
  return redisClient;
}

export async function checkRateLimit(userId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const redis = await getRedisClient();
  const key = `rate_limit:${userId}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const multi = redis.multi();
    multi.zRemRangeByScore(key, 0, now - RATE_LIMIT_WINDOW);
    multi.zAdd(key, { score: now, value: now.toString() });
    multi.zCard(key);
    multi.expire(key, RATE_LIMIT_WINDOW);

    const [, , requestCount] = await multi.exec();
    const remaining = Math.max(0, MAX_REQUESTS - (requestCount as number));
    const reset = now + RATE_LIMIT_WINDOW;

    return {
      success: remaining > 0,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open in case of Redis errors
    return {
      success: true,
      remaining: 1,
      reset: now + RATE_LIMIT_WINDOW,
    };
  }
} 