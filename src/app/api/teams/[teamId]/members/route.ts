import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { z } from 'zod';
import mongoose from 'mongoose';

// GET /api/teams/[teamId]/members
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

    // Fetch all team members including the leader
    const members = await User.find({
      $or: [
        { _id: { $in: team.members } },
        { _id: team.leaderId }
      ]
    }).select('firstName lastName email teamRole');

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[teamId]/members
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

    // Only team leader can invite members
    if (team.leaderId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team leader can invite members' },
        { status: 403 }
      );
    }

    const schema = z.object({
      email: z.string().email(),
    });

    const body = await req.json();
    const { email } = schema.parse(body);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (team.members.includes(user._id) || team.leaderId.equals(user._id)) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Add user to team members
    team.members.push(user._id);
    await team.save();

    // Add team to user's teams
    if (!user.teams) user.teams = [];
    user.teams.push(team._id);
    await user.save();

    // TODO: Send email notification to invited user

    return NextResponse.json({ message: 'Member invited successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId]/members/[memberId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
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

    // Only team leader can remove members
    if (team.leaderId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team leader can remove members' },
        { status: 403 }
      );
    }

    // Cannot remove team leader
    if (team.leaderId.toString() === params.memberId) {
      return NextResponse.json(
        { error: 'Cannot remove team leader' },
        { status: 400 }
      );
    }

    // Remove member from team
    team.members = team.members.filter(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() !== params.memberId
    );
    await team.save();

    // Remove team from user's teams
    const user = await User.findById(params.memberId);
    if (user && user.teams) {
      user.teams = user.teams.filter(
        (teamId: mongoose.Types.ObjectId) => teamId.toString() !== params.teamId
      );
      await user.save();
    }

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
