import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    // Check Redis connection
    const redisStatus = await checkRedis();
    
    // Check MongoDB connection
    const mongoStatus = await checkMongo();

    if (redisStatus.ok && mongoStatus.ok) {
      return NextResponse.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            redis: redisStatus,
            mongodb: mongoStatus,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          redis: redisStatus,
          mongodb: mongoStatus,
        },
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function checkRedis() {
  try {
    const pong = await redis.ping();
    return {
      ok: pong === 'PONG',
      latency: await measureRedisLatency(),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Redis check failed',
    };
  }
}

async function checkMongo() {
  try {
    const startTime = Date.now();
    const conn = await connectDB();
    const latency = Date.now() - startTime;

    return {
      ok: conn.readyState === 1,
      latency,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'MongoDB check failed',
    };
  }
}

async function measureRedisLatency() {
  const iterations = 3;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await redis.ping();
    times.push(Date.now() - start);
  }

  return Math.round(times.reduce((a, b) => a + b, 0) / iterations);
} 