import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Team } from '@/models/Team';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find team where the user is a member
    const team = await Team.findOne({
      'members.user': session.user.id,
    }).select('_id name description leader members');

    if (!team) {
      return NextResponse.json(
        { error: 'No team found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      teamId: team._id,
      name: team.name,
      description: team.description,
      leader: team.leader,
      members: team.members,
    });
  } catch (error) {
    console.error('Error fetching current team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 