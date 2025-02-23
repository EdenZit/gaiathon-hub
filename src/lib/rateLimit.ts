import LRUCache from 'lru-cache';
import { NextRequest } from 'next/server';

export interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export interface RateLimitResult {
  check: (req: NextRequest, limit: number, token: string) => Promise<void>;
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const tokenCache = new LRUCache<string, number>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: async (req: NextRequest, limit: number, token: string) => {
      const currentUsage = tokenCache.get(token) || 0;
      const isRateLimited = currentUsage >= limit;
      
      if (isRateLimited) {
        throw new Error('Rate limit exceeded');
      }

      tokenCache.set(token, currentUsage + 1);
    },
  };
} 