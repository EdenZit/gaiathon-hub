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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const teams = await Team.findByMember(session.user.id)
      .populate('leaderId members', 'firstName lastName email');

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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    // Check if team name already exists (case-insensitive)
    const existingTeam = await Team.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') } 
    });
    
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 400 }
      );
    }

    // Create the team with proper error handling
    try {
      const team = new Team({
        name: validatedData.name,
        category: validatedData.category,
        leaderId: new Types.ObjectId(session.user.id),
        members: [new Types.ObjectId(session.user.id)]
      });

      await team.save();

      // Update user's role to leader
      await User.findByIdAndUpdate(
        session.user.id,
        { 
          $set: { 
            teamRole: 'leader',
            status: 'active'
          } 
        },
        { new: true }
      );

      // If member emails were provided, store them for invitation processing
      if (validatedData.memberEmails?.length) {
        // Here you would typically store the pending invitations
        // This will be handled by your invitation system
        console.log('Member emails to invite:', validatedData.memberEmails);
      }

      return NextResponse.json({
        message: 'Team created successfully',
        team: {
          id: team._id,
          name: team.name,
          category: team.category,
          leaderId: team.leaderId
        }
      });
    } catch (saveError) {
      console.error('Error saving team:', saveError);
      return NextResponse.json(
        { error: 'Failed to save team' },
        { status: 500 }
      );
    }
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