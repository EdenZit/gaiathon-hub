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

    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');

    // Build query based on severity filter
    const query = severity && severity !== 'all' ? { severity } : {};

    // Fetch errors with pagination
    const errors = await ErrorLog.find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    // Calculate statistics
    const stats = {
      total: await ErrorLog.countDocuments(),
      unresolved: await ErrorLog.countDocuments({ resolved: false }),
      critical: await ErrorLog.countDocuments({ severity: 'critical' }),
      byCode: {} as Record<string, number>,
      byPath: {} as Record<string, number>
    };

    // Aggregate error counts by code and path
    const byCodeAgg = await ErrorLog.aggregate([
      { $group: { _id: '$code', count: { $sum: 1 } } }
    ]);
    const byPathAgg = await ErrorLog.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } }
    ]);

    byCodeAgg.forEach(({ _id, count }) => {
      if (_id) stats.byCode[_id] = count;
    });
    byPathAgg.forEach(({ _id, count }) => {
      if (_id) stats.byPath[_id] = count;
    });

    return NextResponse.json({ errors, stats });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error logs' },
      { status: 500 }
    );
  }
} 