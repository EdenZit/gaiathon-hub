import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Team } from '@/models/Team';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';

// Schema for team creation validation
const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().min(1, 'Description is required'),
});

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

    const body = await request.json();
    const validatedData = teamSchema.parse(body);

    // Create new team
    const team = new Team({
      name: validatedData.name,
      description: validatedData.description,
      leader: session.user.id,
      members: [{
        user: session.user.id,
        role: 'leader',
        joinedAt: new Date(),
        permissions: {
          canManageMembers: true,
          canManageDocuments: true,
          canManageProjects: true,
          canApproveProgress: true,
        },
      }],
      activity: [{
        type: 'member',
        action: 'Team created',
        user: session.user.id,
        timestamp: new Date(),
        details: {
          user: {
            name: session.user.name || '',
            id: session.user.id,
          },
        },
      }],
      projects: [],
      documents: [],
      chat: { messages: [] },
      calendar: { events: [] },
      progress: {
        tasks: [],
        milestones: []
      }
    });

    await team.save();

    return NextResponse.json({
      message: 'Team created successfully',
      teamId: team._id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid team data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find teams where the user is a member
    const teams = await Team.find({
      'members.user': session.user.id,
    }).select('name description leader members');

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 