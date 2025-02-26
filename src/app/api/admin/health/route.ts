import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { redis } from '@/lib/redis';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import os from 'os';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastError?: string;
}

export async function GET(request: NextRequest) {
  // Apply admin middleware check
  const isAdmin = await adminMiddleware(request);
  if (!isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const startTime = Date.now();
    const services: ServiceHealth[] = [];

    // Check MongoDB
    try {
      const mongoStart = Date.now();
      const db = await connectDB();
      const mongoHealth: ServiceHealth = {
        name: 'MongoDB Atlas',
        status: db.readyState === 1 ? 'healthy' : 'down',
        responseTime: Date.now() - mongoStart,
      };
      services.push(mongoHealth);
    } catch (error) {
      services.push({
        name: 'MongoDB Atlas',
        status: 'down',
        responseTime: 0,
        lastError: error instanceof Error ? error.message : 'Connection failed',
      });
    }

    // Check Redis
    try {
      const redisStart = Date.now();
      await redis.ping();
      services.push({
        name: 'Redis',
        status: 'healthy',
        responseTime: Date.now() - redisStart,
      });
    } catch (error) {
      services.push({
        name: 'Redis',
        status: 'down',
        responseTime: 0,
        lastError: error instanceof Error ? error.message : 'Connection failed',
      });
    }

    // Get system metrics
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const uptime = os.uptime();

    // Get application metrics
    const activeUsers = 0; // To be implemented with actual Redis metrics
    const requestsPerMinute = 0;
    const errorRate = 0;
    const avgResponseTime = 0;

    // Determine overall system status
    const overallStatus = services.every(s => s.status === 'healthy')
      ? 'healthy'
      : services.every(s => s.status === 'down')
        ? 'down'
        : 'degraded';

    const healthData = {
      status: overallStatus,
      uptime,
      lastChecked: new Date(),
      services,
      metrics: {
        activeUsers,
        requestsPerMinute,
        errorRate,
        avgResponseTime,
      },
      system: {
        cpuLoad: loadAvg[0],
        memoryUsage: ((totalMem - freeMem) / totalMem) * 100,
        totalMemory: totalMem,
        freeMemory: freeMem,
      },
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check system health' },
      { status: 500 }
    );
  }
} 