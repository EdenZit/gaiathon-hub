import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { redis } from '@/lib/redis';
import os from 'os';

export async function GET(request: NextRequest) {
  // Apply admin middleware check
  const isAdmin = await adminMiddleware(request);
  if (!isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

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
        $match: {
          role: 'user',
          status: 'active'
        }
      },
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

    // Get system resource usage
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Generate timestamps for the last N hours
    const timestamps = Array.from({ length: rangeInHours }, (_, i) => {
      return new Date(now.getTime() - (rangeInHours - i) * 60 * 60 * 1000)
        .toISOString()
        .slice(11, 16); // HH:mm format
    });

    // Generate sample performance data (to be replaced with actual metrics later)
    const avgResponseTime = Array.from({ length: rangeInHours }, () => 
      Math.floor(Math.random() * 100 + 50)
    );
    const requestsPerHour = Array.from({ length: rangeInHours }, () => 
      Math.floor(Math.random() * 1000)
    );
    const errorRates = Array.from({ length: rangeInHours }, () => 
      Number((Math.random() * 2).toFixed(2))
    );

    // Format response with null checks
    const stats = userStats[0] || {
      total: [{ count: 0 }],
      active: [{ count: 0 }],
      newToday: [{ count: 0 }],
      newThisWeek: [{ count: 0 }],
      verified: [{ count: 0 }]
    };

    const tStats = teamStats[0] || {
      total: [{ count: 0 }],
      active: [{ count: 0 }],
      memberCounts: [{ average: 0 }]
    };

    const analyticsData = {
      userStats: {
        total: stats.total[0]?.count || 0,
        active: stats.active[0]?.count || 0,
        newToday: stats.newToday[0]?.count || 0,
        newThisWeek: stats.newThisWeek[0]?.count || 0,
        verificationRate: stats.total[0]?.count ? (stats.verified[0]?.count / stats.total[0]?.count) : 0,
      },
      teamStats: {
        total: tStats.total[0]?.count || 0,
        active: tStats.active[0]?.count || 0,
        averageSize: Math.round(tStats.memberCounts[0]?.average || 0),
      },
      performanceMetrics: {
        timestamps,
        avgResponseTime,
        requestsPerHour,
        errorRates,
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