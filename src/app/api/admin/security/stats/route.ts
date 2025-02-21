import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ErrorLog } from '@/lib/db/models/ErrorLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Use aggregation for better performance
    const [statsResult] = await ErrorLog.aggregate([
      {
        $facet: {
          errorStats: [
            {
              $group: {
                _id: null,
                totalErrors: { $sum: 1 },
                unresolvedErrors: {
                  $sum: { $cond: [{ $eq: ['$resolved', false] }, 1, 0] }
                },
                criticalErrors: {
                  $sum: {
                    $cond: [
                      { 
                        $and: [
                          { $eq: ['$severity', 'critical'] },
                          { $eq: ['$resolved', false] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          loginAttempts: [
            {
              $match: {
                code: 'AUTH_ERROR',
                timestamp: { $gte: oneDayAgo }
              }
            },
            {
              $count: 'count'
            }
          ],
          activeUsers: [
            {
              $match: {
                timestamp: { $gte: oneHourAgo },
                userEmail: { $exists: true }
              }
            },
            {
              $group: {
                _id: '$userEmail'
              }
            },
            {
              $count: 'count'
            }
          ]
        }
      }
    ]);

    const stats = {
      totalErrors: statsResult?.errorStats[0]?.totalErrors || 0,
      unresolvedErrors: statsResult?.errorStats[0]?.unresolvedErrors || 0,
      criticalErrors: statsResult?.errorStats[0]?.criticalErrors || 0,
      loginAttempts: statsResult?.loginAttempts[0]?.count || 0,
      activeUsers: statsResult?.activeUsers[0]?.count || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching security stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security stats' },
      { status: 500 }
    );
  }
} 