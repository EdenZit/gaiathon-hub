import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsService } from '@/lib/services/analytics';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = AnalyticsService.getInstance();
    const timespan = parseInt(req.nextUrl.searchParams.get('timespan') || '86400'); // Default 24 hours

    const [activityMetrics, resourceMetrics, performanceMetrics] = await Promise.all([
      analytics.getActivityMetrics(timespan),
      analytics.getResourceMetrics(),
      analytics.getPerformanceMetrics(timespan)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        activity: activityMetrics,
        resources: resourceMetrics,
        performance: performanceMetrics
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 