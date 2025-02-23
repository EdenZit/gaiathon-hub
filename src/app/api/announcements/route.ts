import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { AnnouncementPage } from '@/models/Announcement';
import { revalidatePath } from 'next/cache';

// GET /api/announcements - Get the announcements page content
export async function GET() {
  try {
    await connectDB();
    
    let page = await AnnouncementPage.findOne()
      .populate('updatedBy', 'name')
      .lean();

    if (!page) {
      // Create initial empty page if none exists
      const session = await getServerSession(authOptions);
      if (session?.user) {
        page = await AnnouncementPage.create({
          upcomingEvents: [],
          announcements: [],
          importantDates: [],
          updatedBy: session.user.id
        });
      }
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching announcements page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements page' },
      { status: 500 }
    );
  }
}

// PUT /api/announcements - Update the announcements page content
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    let page = await AnnouncementPage.findOne();
    
    if (!page) {
      page = await AnnouncementPage.create({
        ...data,
        updatedBy: session.user.id
      });
    } else {
      page.upcomingEvents = data.upcomingEvents || page.upcomingEvents;
      page.announcements = data.announcements || page.announcements;
      page.importantDates = data.importantDates || page.importantDates;
      page.lastUpdated = new Date();
      page.updatedBy = session.user.id;
      await page.save();
    }

    // Revalidate the announcements page
    revalidatePath('/company/events');

    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error updating announcements page:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update announcements page',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 