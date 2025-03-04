import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { Types } from 'mongoose';

interface TeamMember {
  user: {
    _id: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    institution?: string;
    country?: string;
  };
  teamRole: string;
}

interface PopulatedTeam {
  _id: Types.ObjectId;
  name: string;
  category: string;
  description: string;
  leaderId: {
    _id: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    institution?: string;
    country?: string;
  };
  members: TeamMember[];
  createdAt: Date;
}

const TEAM_SIZE_LIMITS = {
  MIN: 2,
  MAX: 4
};

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

    // Get all approved teams where the user is not a member or leader
    const availableTeams = await Team.find({
      status: 'approved',
      $and: [
        { leaderId: { $ne: user._id } },
        { 'members.user': { $ne: user._id } }
      ]
    })
    .populate('leaderId', 'firstName lastName email institution country')
    .populate('members.user', 'firstName lastName email institution country')
    .sort({ createdAt: -1 })
    .lean();

    // Type assertion after validation
    const teams = availableTeams as unknown as PopulatedTeam[];

    // Transform teams to include necessary information
    const transformedTeams = teams.map(team => ({
      _id: team._id.toString(),
      name: team.name,
      category: team.category,
      description: team.description,
      leaderId: team.leaderId._id.toString(),
      leaderDetails: {
        firstName: team.leaderId.firstName || '',
        lastName: team.leaderId.lastName || '',
        email: team.leaderId.email,
        institution: team.leaderId.institution || '',
        country: team.leaderId.country || ''
      },
      members: team.members.map(member => ({
        userId: member.user._id.toString(),
        firstName: member.user.firstName || '',
        lastName: member.user.lastName || '',
        email: member.user.email,
        teamRole: member.teamRole,
        institution: member.user.institution || '',
        country: member.user.country || ''
      })),
      memberCount: team.members.length + 1, // +1 for the leader
      sizeLimits: TEAM_SIZE_LIMITS,
      createdAt: team.createdAt
    }));

    return NextResponse.json(transformedTeams);
  } catch (error) {
    console.error('Error fetching available teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available teams' },
      { status: 500 }
    );
  }
} 