import { createClient } from 'redis';
import { TokenUsage, TokenUsageRecord, tokenUsageSchema } from '@/types/openai';
import { WEEKLY_TOKEN_LIMIT } from '@/lib/openai';

const REDIS_KEY_PREFIX = 'token_usage:';

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

export async function getTokenUsage(userId: string): Promise<TokenUsageRecord | null> {
  const redis = await getRedisClient();
  const key = `${REDIS_KEY_PREFIX}${userId}`;
  const data = await redis.get(key);

  if (!data) return null;

  try {
    return tokenUsageSchema.parse(JSON.parse(data));
  } catch (error) {
    console.error('Error parsing token usage:', error);
    return null;
  }
}

export async function updateTokenUsage(
  userId: string,
  newTokens: TokenUsage
): Promise<TokenUsageRecord | null> {
  const redis = await getRedisClient();
  const key = `${REDIS_KEY_PREFIX}${userId}`;
  const currentDate = new Date();

  // Get current usage
  const currentUsage = await getTokenUsage(userId);
  
  // Initialize new usage record if none exists or if it's a new week
  if (!currentUsage || isNewWeek(currentUsage.weekStartDate, currentDate)) {
    const newUsage: TokenUsageRecord = {
      userId,
      weekStartDate: getWeekStartDate(currentDate),
      totalTokens: newTokens.total_tokens,
      lastUpdated: currentDate,
    };

    await redis.set(key, JSON.stringify(newUsage));
    return newUsage;
  }

  // Update existing usage
  const updatedUsage: TokenUsageRecord = {
    ...currentUsage,
    totalTokens: currentUsage.totalTokens + newTokens.total_tokens,
    lastUpdated: currentDate,
  };

  await redis.set(key, JSON.stringify(updatedUsage));
  return updatedUsage;
}

export async function checkTokenLimit(userId: string): Promise<boolean> {
  const currentUsage = await getTokenUsage(userId);
  
  if (!currentUsage) return false;
  
  return currentUsage.totalTokens >= WEEKLY_TOKEN_LIMIT;
}

export async function generateUsageReport(): Promise<{
  totalUsers: number;
  totalTokens: number;
  averageTokensPerUser: number;
}> {
  const redis = await getRedisClient();
  const keys = await redis.keys(`${REDIS_KEY_PREFIX}*`);
  
  if (keys.length === 0) {
    return {
      totalUsers: 0,
      totalTokens: 0,
      averageTokensPerUser: 0,
    };
  }

  let totalTokens = 0;
  let validUsers = 0;

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      try {
        const usage = tokenUsageSchema.parse(JSON.parse(data));
        totalTokens += usage.totalTokens;
        validUsers++;
      } catch (error) {
        console.error(`Error parsing usage data for key ${key}:`, error);
      }
    }
  }

  return {
    totalUsers: validUsers,
    totalTokens,
    averageTokensPerUser: validUsers > 0 ? Math.round(totalTokens / validUsers) : 0,
  };
}

function getWeekStartDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  newDate.setDate(date.getDate() - date.getDay());
  return newDate;
}

function isNewWeek(lastDate: Date, currentDate: Date): boolean {
  const lastWeekStart = getWeekStartDate(new Date(lastDate));
  const currentWeekStart = getWeekStartDate(currentDate);
  return currentWeekStart.getTime() > lastWeekStart.getTime();
} 