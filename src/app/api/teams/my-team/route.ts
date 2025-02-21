import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { Types } from 'mongoose';

interface TeamMember {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
}

interface RawTeam {
  _id: Types.ObjectId;
  name: string;
  category: string;
  leaderId: Types.ObjectId;
  members: TeamMember[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find team where user is either leader or member
    const rawTeam = await Team.findOne({
      $or: [
        { leaderId: new Types.ObjectId(session.user.id) },
        { members: new Types.ObjectId(session.user.id) }
      ]
    })
    .populate('members', 'email firstName lastName name')
    .lean();

    if (!rawTeam) {
      return NextResponse.json(
        { message: 'No team found' },
        { status: 404 }
      );
    }

    // Safe type assertion after validation
    const team = rawTeam as unknown as RawTeam;

    // Transform the data to ensure consistent structure
    const transformedTeam = {
      ...team,
      _id: team._id.toString(),
      leaderId: team.leaderId.toString(),
      members: team.members.map((member: TeamMember) => ({
        ...member,
        _id: member._id.toString()
      }))
    };

    return NextResponse.json({ team: transformedTeam });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
} 