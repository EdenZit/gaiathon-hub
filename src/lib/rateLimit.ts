import { NextRequest } from 'next/server';

export interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export interface RateLimitResult {
  check: (req: NextRequest, limit: number, token: string) => Promise<void>;
}

// Simple token cache implementation using Map
class TokenCache {
  private cache: Map<string, { count: number; expires: number }>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(token: string): number {
    const now = Date.now();
    const item = this.cache.get(token);
    
    // Return 0 if item doesn't exist or has expired
    if (!item || item.expires < now) {
      return 0;
    }
    
    return item.count;
  }

  set(token: string, count: number, ttl: number): void {
    // Clean expired entries if we're at capacity
    if (this.cache.size >= this.maxSize) {
      this.cleanExpired();
    }
    
    // If still at capacity, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const keys = Array.from(this.cache.keys());
      if (keys.length > 0) {
        this.cache.delete(keys[0]);
      }
    }
    
    this.cache.set(token, {
      count,
      expires: Date.now() + ttl
    });
  }

  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (value.expires < now) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const tokenCache = new TokenCache(options.uniqueTokenPerInterval);

  return {
    check: async (req: NextRequest, limit: number, token: string) => {
      const currentUsage = tokenCache.get(token);
      const isRateLimited = currentUsage >= limit;
      
      if (isRateLimited) {
        throw new Error('Rate limit exceeded');
      }

      tokenCache.set(token, currentUsage + 1, options.interval);
    },
  };
} 