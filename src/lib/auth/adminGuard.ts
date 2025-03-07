import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Redis from "ioredis";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";

// Create a new Redis client for Docker
const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

// Simple rate limiting implementation
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

async function checkRateLimit(userId: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const now = Date.now();
  const key = `ratelimit:admin:${userId}`;
  
  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, now - RATE_LIMIT_WINDOW);
  multi.zadd(key, now, now.toString());
  multi.zcard(key);
  multi.expire(key, 60);
  
  const [, , count] = await multi.exec() as [any, any, [null | Error, number]];
  
  const reset = now + RATE_LIMIT_WINDOW;
  const remaining = Math.max(0, RATE_LIMIT_MAX - (count?.[1] || 0));
  
  return {
    success: remaining > 0,
    limit: RATE_LIMIT_MAX,
    remaining,
    reset,
  };
}

interface AdminActionLog {
  timestamp: Date;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  error?: string;
}

async function logAdminAction(
  action: string,
  session: any,
  req: NextRequest,
  success: boolean,
  error?: string
) {
  const headersList = headers();
  const log: AdminActionLog = {
    timestamp: new Date(),
    action,
    userId: session?.user?.id || "unknown",
    userEmail: session?.user?.email || "unknown",
    ipAddress: req.ip || headersList.get("x-forwarded-for") || "unknown",
    userAgent: req.headers.get("user-agent") || "unknown",
    success,
    error,
  };

  // Store in Redis for real-time monitoring
  await redis.lpush("admin:activity:logs", JSON.stringify(log));
  // Keep only last 1000 logs
  await redis.ltrim("admin:activity:logs", 0, 999);

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("Admin Action Log:", log);
  }
}

export async function adminGuard(req: NextRequest, action: string = "unknown") {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in adminGuard:', {
      id: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
      name: session?.user?.name
    });
    
    // Check basic authentication
    if (!session?.user) {
      console.log('No session found in adminGuard');
      throw new Error("No session found");
    }

    // Check admin role
    if (session.user.role !== "admin") {
      console.log('User is not admin. Current role:', session.user.role);
      throw new Error("User is not an admin");
    }

    // Rate limiting check
    const { success, limit, reset, remaining } = await checkRateLimit(
      session.user.id || "anonymous"
    );

    if (!success) {
      await logAdminAction(action, session, req, false, "Rate limit exceeded");
      return NextResponse.json(
        {
          error: "Too many requests",
          code: "RATE_LIMIT_EXCEEDED",
          message: "Please try again later",
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    // Log successful auth
    await logAdminAction(action, session, req, true);
    console.log('Admin access granted for:', session.user.email);
    
    return true;

  } catch (error) {
    // Log failed attempt
    const session = await getServerSession(authOptions);
    console.error('Admin guard error:', error);
    await logAdminAction(
      action,
      session,
      req,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );

    return false;
  }
}

export async function validateAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }
  return session;
}

export async function getAdminLogs(limit: number = 100) {
  const logs = await redis.lrange("admin:activity:logs", 0, limit - 1);
  return logs.map(log => JSON.parse(log));
} 