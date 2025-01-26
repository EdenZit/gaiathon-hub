import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Types } from 'mongoose';
import { Message } from '@/lib/db/models/Message';
import { Team } from '@/lib/db/models/Team';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify team membership
    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (!team.isMember(session.user.id)) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
    }

    // Get messages with pagination
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ team: new Types.ObjectId(params.teamId) })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email')
      .lean();

    return NextResponse.json({
      messages: messages.reverse(),
      page,
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Failed to get messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify team membership
    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (!team.isMember(session.user.id)) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
    }

    const body = await request.json();
    const { content, type = 'text', metadata = {} } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const message = new Message({
      content,
      sender: new Types.ObjectId(session.user.id),
      team: new Types.ObjectId(params.teamId),
      type,
      metadata,
    });

    await message.save();

    // Add to team's activity
    team.activity.push({
      type: 'message',
      action: 'Message sent',
      user: new Types.ObjectId(session.user.id),
      timestamp: new Date(),
      details: {
        messageType: type,
      },
    });

    await team.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .lean();

    return NextResponse.json(populatedMessage);
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 