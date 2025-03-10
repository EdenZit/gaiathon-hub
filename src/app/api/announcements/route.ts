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
      console.error('Authentication required for PUT /api/announcements');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for CSRF protection header
    const csrfHeader = request.headers.get('X-CSRF-Protection');
    if (!csrfHeader) {
      console.error('CSRF protection header missing for PUT /api/announcements');
      return NextResponse.json(
        { error: 'CSRF protection required' },
        { status: 403 }
      );
    }

    await connectDB();
    const data = await request.json();
    console.log('Received data for announcements update:', JSON.stringify(data).substring(0, 200) + '...');

    let page = await AnnouncementPage.findOne();
    
    if (!page) {
      console.log('Creating new AnnouncementPage document');
      page = await AnnouncementPage.create({
        ...data,
        updatedBy: session.user.id
      });
    } else {
      console.log('Updating existing AnnouncementPage document');
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

// Add OPTIONS method to handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Protection',
      'Access-Control-Max-Age': '86400',
    },
  });
} 