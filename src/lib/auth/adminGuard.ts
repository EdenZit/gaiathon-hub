import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Create a new ratelimiter for admin endpoints
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const adminLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"), // 10 requests per minute
  analytics: true,
  prefix: "@upstash/ratelimit/admin",
});

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
    console.log("Admin Action:", log);
  }
}

export async function adminGuard(req: NextRequest, action: string = "unknown") {
  const session = await getServerSession();
  
  try {
    // Check basic authentication
    if (!session?.user) {
      throw new Error("No session found");
    }

    // Check admin role
    if (session.user.role !== "admin") {
      throw new Error("User is not an admin");
    }

    // Rate limiting check
    const { success, limit, reset, remaining } = await adminLimiter.limit(
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
    
    // Allow the request to proceed
    return null;

  } catch (error) {
    // Log failed attempt
    await logAdminAction(
      action,
      session,
      req,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error: "Unauthorized",
        code: "UNAUTHORIZED_ACCESS",
        message: "You must be an administrator to access this resource",
      },
      { status: 403 }
    );
  }
}

export async function validateAdminSession() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }
  return session;
}

export async function getAdminLogs(limit: number = 100) {
  const logs = await redis.lrange("admin:activity:logs", 0, limit - 1);
  return logs.map(log => JSON.parse(log));
} 