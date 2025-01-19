import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';

interface TeamMember {
  user: string;
  role: string;
}

const inviteSchema = z.object({
  userEmails: z.array(z.string().email()),
});

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

    // Find the team where the current user is a leader
    const team = await Team.findOne({
      'members.user': session.user.email,
      'members.role': 'leader',
    });

    if (!team) {
      return NextResponse.json(
        { error: 'You must be a team leader to send invitations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = inviteSchema.parse(body);

    // Check if users exist and have completed profiles
    const users = await User.find({
      email: { $in: validatedData.userEmails },
      profileCompleted: true,
    });

    if (users.length !== validatedData.userEmails.length) {
      return NextResponse.json(
        { error: 'One or more selected users do not exist or have incomplete profiles' },
        { status: 400 }
      );
    }

    // Check if any users are already team members
    const existingMembers = team.members.map((member: TeamMember) => member.user);
    const alreadyMembers = users.filter(user => 
      existingMembers.includes(user.email)
    );

    if (alreadyMembers.length > 0) {
      return NextResponse.json(
        { error: `Some users are already team members: ${alreadyMembers.map(u => u.email).join(', ')}` },
        { status: 400 }
      );
    }

    // Create invitations
    const invitations = users.map(user => ({
      user: user.email,
      team: team._id,
      status: 'pending',
      invitedBy: session.user.email,
      invitedAt: new Date(),
    }));

    // Save invitations to the team
    team.invitations = [...(team.invitations || []), ...invitations];
    await team.save();

    // Add activity log
    team.activity.push({
      type: 'member',
      action: 'Invitations sent',
      user: session.user.email,
      timestamp: new Date(),
      details: {
        invitedUsers: users.map(u => ({ email: u.email, name: u.fullName })),
      },
    });
    await team.save();

    return NextResponse.json({
      message: 'Invitations sent successfully',
      invitedUsers: users.map(u => ({ email: u.email, name: u.fullName })),
    });
  } catch (error) {
    console.error('Error sending invitations:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invitation data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 