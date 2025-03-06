import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import { AnnouncementPage, IAnnouncementPage } from '@/models/Announcement';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get actual count of announcements
    const count = await AnnouncementPage.countDocuments({});
    
    // Get all announcement documents for inspection
    const announcements = await AnnouncementPage.find({}).lean();
    
    return NextResponse.json({
      count,
      announcements: announcements.map((a: any) => ({
        id: a._id.toString(),
        upcomingEvents: a.upcomingEvents.length,
        announcements: a.announcements.length,
        importantDates: a.importantDates.length,
        lastUpdated: a.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 