import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { z } from 'zod';

// Schema for team creation validation
const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  memberEmails: z.array(z.string().email('Invalid email address')),
});

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

    const teams = await Team.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'leaderId',
          foreignField: '_id',
          as: 'leader'
        }
      },
      {
        $unwind: '$leader'
      },
      {
        $project: {
          name: 1,
          description: 1,
          leader: {
            firstName: 1,
            lastName: 1,
            email: 1
          },
          memberCount: { $size: '$members' }
        }
      }
    ]);

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Verify user is a leader
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.teamRole !== 'leader') {
      return NextResponse.json(
        { error: 'Only team leaders can create teams' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = teamSchema.parse(body);

    // Create team
    const team = await Team.create({
      name: validatedData.name,
      description: validatedData.description,
      leaderId: user._id,
      members: [user._id], // Leader is also a member
    });

    // Update user's teams array
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { teams: team._id }
    });

    // Send invitations to members
    // TODO: Implement email invitations
    console.log('Sending invitations to:', validatedData.memberEmails);

    return NextResponse.json({
      message: 'Team created successfully',
      team: {
        id: team._id,
        name: team.name,
        description: team.description,
      }
    });
  } catch (error) {
    console.error('Error creating team:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 