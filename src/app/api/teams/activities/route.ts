import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Team } from '@/models/Team';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';

interface Activity {
  _id: string;
  type: 'document' | 'chat' | 'calendar' | 'progress' | 'team';
  action: string;
  details: {
    user?: {
      name: string;
      id: string;
    };
    title?: string;
    message?: string;
    target?: string;
  };
  timestamp: Date;
  isRead: boolean;
}

// Schema for activity data validation
const activitySchema = z.object({
  type: z.enum(['document', 'chat', 'calendar', 'progress', 'team']),
  action: z.string(),
  details: z.object({
    user: z.object({
      name: z.string(),
      id: z.string(),
    }).optional(),
    title: z.string().optional(),
    message: z.string().optional(),
    target: z.string().optional(),
  }),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const type = url.searchParams.get('type') as Activity['type'] | undefined;
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Filter activities based on query parameters
    let activities = team.activity;

    if (type) {
      activities = activities.filter((activity: Activity) => activity.type === type);
    }

    if (unreadOnly) {
      activities = activities.filter((activity: Activity) => !activity.isRead);
    }

    // Sort by timestamp (newest first) and limit results
    activities = activities
      .sort((a: Activity, b: Activity) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = activitySchema.parse(body);

    // Create new activity
    const newActivity = {
      ...validatedData,
      timestamp: new Date(),
      isRead: false,
    };

    team.activity.unshift(newActivity);

    // Limit activity log size to prevent excessive growth
    const MAX_ACTIVITIES = 1000;
    if (team.activity.length > MAX_ACTIVITIES) {
      team.activity = team.activity.slice(0, MAX_ACTIVITIES);
    }

    await team.save();

    return NextResponse.json({
      message: 'Activity logged successfully',
      activity: newActivity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid activity data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const activityId = url.searchParams.get('id');

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Find and update the activity
    const activity = team.activity.id(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    activity.isRead = true;
    await team.save();

    return NextResponse.json({
      message: 'Activity marked as read',
      activity,
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const activityId = url.searchParams.get('id');

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the team where the user is a leader
    const team = await Team.findOne({
      'members.userId': session.user.id,
      'members.role': 'leader',
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Not authorized to delete activities' },
        { status: 403 }
      );
    }

    // Find and remove the activity
    const activity = team.activity.id(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    activity.remove();
    await team.save();

    return NextResponse.json({
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 