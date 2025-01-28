import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { JoinRequest } from '@/models/JoinRequest';

// POST /api/teams/[teamId]/join-requests
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

    // Check if user is already a member
    if (team.members.includes(session.user.id) || team.leaderId === session.user.id) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Check if there's a pending request
    const existingRequest = await JoinRequest.findOne({
      teamId: params.teamId,
      userId: session.user.id,
      status: 'pending',
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending join request' },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await JoinRequest.create({
      teamId: params.teamId,
      userId: session.user.id,
      status: 'pending',
    });

    // TODO: Send notification to team leader

    return NextResponse.json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Error sending join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/teams/[teamId]/join-requests
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

    // Only team leader can view join requests
    if (team.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team leader can view join requests' },
        { status: 403 }
      );
    }

    const joinRequests = await JoinRequest.find({
      teamId: params.teamId,
      status: 'pending',
    }).populate('userId', 'firstName lastName email');

    return NextResponse.json(joinRequests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[teamId]/join-requests/[requestId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { teamId: string; requestId: string } }
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

    // Only team leader can approve/reject join requests
    if (team.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only team leader can manage join requests' },
        { status: 403 }
      );
    }

    const { status } = await req.json();
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const joinRequest = await JoinRequest.findById(params.requestId);
    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      );
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Join request has already been processed' },
        { status: 400 }
      );
    }

    joinRequest.status = status;
    await joinRequest.save();

    if (status === 'approved') {
      // Add user to team members
      team.members.push(joinRequest.userId);
      await team.save();

      // Add team to user's teams
      const user = await User.findById(joinRequest.userId);
      if (user) {
        if (!user.teams) user.teams = [];
        user.teams.push(team._id);
        await user.save();
      }

      // TODO: Send notification to user about approval
    } else {
      // TODO: Send notification to user about rejection
    }

    return NextResponse.json({
      message: `Join request ${status}`,
    });
  } catch (error) {
    console.error('Error processing join request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
