import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify the team exists and the user is the leader
    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if the user is the team leader
    if (team.leaderId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team leaders can send invitations' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { email } = inviteSchema.parse(body);

    // Check if user exists
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (team.members.includes(invitedUser._id)) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Add user to team
    team.members.push(invitedUser._id);
    team.activity.push({
      type: 'member',
      action: 'Member invited',
      user: session.user.id,
      timestamp: new Date(),
      details: {
        invitedUser: invitedUser._id,
        invitedEmail: email
      }
    });

    await team.save();

    // Update user's teams array
    await User.findByIdAndUpdate(invitedUser._id, {
      $addToSet: { teams: team._id },
      hasActiveTeam: true
    });

    return NextResponse.json({
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Error sending team invitation:', error);

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
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
} 