import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { User } from '@/lib/db/models/User';
import { adminGuard } from '@/lib/auth/adminGuard';
import { Types } from 'mongoose';
import { authOptions } from '@/lib/auth';

interface TeamMember {
  user: Types.ObjectId;
  teamRole: 'leader' | 'member';
  joinedAt: Date;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (name) team.name = name;
    if (description) team.description = description;

    await team.save();
    await team.populate('leader members.user', 'name email');

    return NextResponse.json({ message: 'Team updated successfully', team });
  } catch (error: any) {
    console.error('Error updating team:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Team name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      console.error('Unauthorized team deletion attempt:', {
        userId: session?.user?.id,
        role: session?.user?.role,
        teamId: params.id
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get the team leader
    const teamLeader = await User.findById(team.leaderId);
    if (teamLeader) {
      // Remove team from leader's teams array
      if (teamLeader.teams) {
        teamLeader.teams = teamLeader.teams.filter(id => !id.equals(team._id));
        await teamLeader.save();
      }
    }

    // Remove team from all members' teams arrays
    const memberIds = team.members.map((member: TeamMember) => member.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { teams: team._id } }
    );

    // Delete the team
    await Team.findByIdAndDelete(params.id);

    console.log('Team deleted successfully:', {
      teamId: params.id,
      deletedBy: session.user.id
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting team:', {
      error: error.message,
      teamId: params.id,
      stack: error.stack
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware } from '@/middleware/adminMiddleware'; 