import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import { Message } from '@/models/Message';
import { z } from 'zod';

// GET /api/teams/[teamId]/messages
export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is a member of the team
    if (!team.members.includes(session.user.id) && team.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const before = url.searchParams.get('before');

    // Build query
    const query: any = { teamId: params.teamId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages with sender information
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'firstName lastName')
      .lean();

    return NextResponse.json({
      messages: messages.map(message => ({
        id: message._id,
        content: message.content,
        sender: {
          id: message.senderId._id,
          firstName: message.senderId.firstName,
          lastName: message.senderId.lastName,
        },
        teamId: message.teamId,
        createdAt: message.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[teamId]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is a member of the team
    if (!team.members.includes(session.user.id) && team.leaderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schema = z.object({
      content: z.string().min(1).max(1000),
    });

    const body = await req.json();
    const { content } = schema.parse(body);

    // Create message
    const message = await Message.create({
      content,
      teamId: params.teamId,
      senderId: session.user.id,
    });

    // Populate sender information
    await message.populate('senderId', 'firstName lastName');

    // Format response
    const response = {
      id: message._id,
      content: message.content,
      sender: {
        id: message.senderId._id,
        firstName: message.senderId.firstName,
        lastName: message.senderId.lastName,
      },
      teamId: message.teamId,
      createdAt: message.createdAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 