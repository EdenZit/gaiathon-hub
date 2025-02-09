import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { redis } from '@/lib/redis';
import os from 'os';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

    const db = await connectDB();

    // Calculate time range
    const now = new Date();
    const rangeInHours = range === '30d' ? 720 : range === '7d' ? 168 : 24;
    const startDate = new Date(now.getTime() - rangeInHours * 60 * 60 * 1000);

    // Get user statistics
    const userStats = await db.collection('users').aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { lastActive: { $gte: startDate } } },
            { $count: 'count' }
          ],
          newToday: [
            { $match: { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } } },
            { $count: 'count' }
          ],
          newThisWeek: [
            { $match: { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
            { $count: 'count' }
          ],
          verified: [
            { $match: { emailVerified: true } },
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();

    // Get team statistics
    const teamStats = await db.collection('teams').aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { lastActive: { $gte: startDate } } },
            { $count: 'count' }
          ],
          memberCounts: [
            { $project: { memberCount: { $size: '$members' } } },
            { $group: { _id: null, average: { $avg: '$memberCount' } } }
          ]
        }
      }
    ]).toArray();

    // Get performance metrics from Redis
    const redisClient = redis.getClient();
    const [responseTimesStr, requestsStr, errorRatesStr] = await Promise.all([
      redisClient.lrange('metrics:responseTime', 0, rangeInHours - 1),
      redisClient.lrange('metrics:requests', 0, rangeInHours - 1),
      redisClient.lrange('metrics:errors', 0, rangeInHours - 1),
    ]);

    const timestamps = Array.from({ length: rangeInHours }, (_, i) => {
      return new Date(now.getTime() - (rangeInHours - i) * 60 * 60 * 1000)
        .toISOString()
        .slice(11, 16); // HH:mm format
    });

    // Get system resource usage
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Format response
    const stats = userStats[0];
    const tStats = teamStats[0];

    const analyticsData = {
      userStats: {
        total: stats.total[0]?.count || 0,
        active: stats.active[0]?.count || 0,
        newToday: stats.newToday[0]?.count || 0,
        newThisWeek: stats.newThisWeek[0]?.count || 0,
        verificationRate: stats.verified[0]?.count / stats.total[0]?.count || 0,
      },
      teamStats: {
        total: tStats.total[0]?.count || 0,
        active: tStats.active[0]?.count || 0,
        averageSize: Math.round(tStats.memberCounts[0]?.average || 0),
      },
      performanceMetrics: {
        avgResponseTime: responseTimesStr.map((t: string) => parseFloat(t) || 0),
        requestsPerHour: requestsStr.map((r: string) => parseInt(r) || 0),
        errorRates: errorRatesStr.map((e: string) => parseFloat(e) || 0),
        timestamps,
      },
      resourceUsage: {
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round(memoryUsage),
        diskUsage: 0, // Implement disk usage check if needed
        networkBandwidth: 0, // Implement network bandwidth check if needed
      },
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware }; 