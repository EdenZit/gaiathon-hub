import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { User } from '@/lib/db/models/User';
import { z } from 'zod';
import { Types } from 'mongoose';

const TEAM_CATEGORIES = [
  'Digital Platforms and Interactive Applications',
  'IoT-Enabled Smart Systems',
  'Geospatial Intelligence and Policy Innovation'
] as const;

const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  category: z.enum(TEAM_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid team category' })
  }),
  memberEmails: z.array(z.string().email('Invalid email format')).optional()
});

interface UpdatedUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  teamRole: 'leader' | 'member';
  status: 'active' | 'inactive';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all teams the user is a member of
    const teams = await Team.find({
      members: user._id
    }).populate('leaderId members', 'firstName lastName email');

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify user and their role
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a team leader
    if (user.teamRole !== 'leader') {
      return NextResponse.json(
        { error: 'Only team leaders can create teams' },
        { status: 403 }
      );
    }
    
    // Check if user is already in a team
    const existingTeam = await Team.findOne({
      $or: [
        { leaderId: user._id },
        { members: user._id }
      ]
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You are already a member of a team' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    // Check if team name already exists (case-insensitive)
    const existingTeamName = await Team.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') } 
    });
    
    if (existingTeamName) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 400 }
      );
    }

    // Create the team
    const team = await Team.create({
      name: validatedData.name,
      category: validatedData.category,
      leaderId: user._id,
      members: [user._id],
      status: 'pending'
    });

    // Update user's team status
    await User.findByIdAndUpdate(
      user._id,
      { 
        $set: { hasActiveTeam: true },
        $push: { teams: team._id }
      }
    );

    // Process member invitations if provided
    if (validatedData.memberEmails?.length) {
      // Store the pending invitations for processing
      console.log('Member emails to invite:', validatedData.memberEmails);
    }

    return NextResponse.json({
      message: 'Team created successfully',
      team: {
        id: team._id,
        name: team.name,
        category: team.category,
        leaderId: team.leaderId,
        status: team.status
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
} 