import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db/connection';
import { Team } from '@/lib/db/models/Team';
import { adminGuard } from '@/lib/auth/adminGuard';
import { Types, Document } from 'mongoose';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/db/models/User';

type TeamCategory = 
  | 'Digital Platforms and Interactive Applications'
  | 'IoT-Enabled Smart Systems'
  | 'Geospatial Intelligence and Policy Innovation';

interface IUser {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  institution?: string;
  country?: string;
}

interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  category: TeamCategory;
  leaderId: IUser;
  members: IUser[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

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
  joinedAt: Date;
}

interface RawTeamMember {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  teamRole?: 'leader' | 'member';
  institution?: string;
  country?: string;
}

interface TransformedTeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamRole: 'leader' | 'member';
  institution: string;
  country: string;
}

interface DBTeam {
  _id: Types.ObjectId;
  name: string;
  category: 'Digital Platforms and Interactive Applications' | 'IoT-Enabled Smart Systems' | 'Geospatial Intelligence and Policy Innovation';
  status: 'pending' | 'approved' | 'rejected';
  members: TeamMember[];
  createdAt: Date;
}

interface TransformedTeam {
  _id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  members: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    teamRole: 'leader' | 'member';
    institution: string;
    country: string;
  }[];
  createdAt: string;
}

interface TeamDocument {
  _id: Types.ObjectId;
  name: string;
  members: TeamMember[];
  createdAt: Date;
}

interface PopulatedTeam {
  _id: Types.ObjectId;
  name: string;
  category: string;
  status: string;
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify admin status
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all teams with populated leader and member details
    const rawTeams = await Team.find({})
      .populate('leaderId', 'firstName lastName email institution country')
      .populate('members.user', 'firstName lastName email institution country')
      .lean();

    // Type assertion after validation
    const teams = rawTeams as unknown as PopulatedTeam[];

    // Transform teams to include full member details
    const transformedTeams = teams.map(team => ({
      _id: team._id,
      name: team.name,
      category: team.category,
      status: team.status,
      leaderId: team.leaderId._id,
      leader: {
        _id: team.leaderId._id,
        firstName: team.leaderId.firstName || '',
        lastName: team.leaderId.lastName || '',
        email: team.leaderId.email,
        institution: team.leaderId.institution || '',
        country: team.leaderId.country || ''
      },
      members: team.members.map((member: TeamMember) => ({
        userId: member.user._id,
        firstName: member.user.firstName || '',
        lastName: member.user.lastName || '',
        email: member.user.email,
        teamRole: member.teamRole,
        institution: member.user.institution || '',
        country: member.user.country || '',
        joinedAt: member.joinedAt
      })),
      createdAt: team.createdAt
    }));

    return NextResponse.json(transformedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'create_team');
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, leaderId } = body;

    if (!name || !leaderId) {
      return NextResponse.json(
        { error: 'Name and leader are required' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team name already exists' },
        { status: 400 }
      );
    }

    // Create new team
    const team = new Team({
      name,
      description,
      leaderId: new Types.ObjectId(leaderId),
      members: [{
        user: new Types.ObjectId(leaderId),
        teamRole: 'leader',
        joinedAt: new Date()
      }],
      status: 'pending'
    });

    await team.save();
    await team.populate('members.user', 'firstName lastName email institution country');
    await team.populate('leaderId', 'firstName lastName email institution country');

    const transformedTeam = {
      _id: team._id.toString(),
      name: team.name,
      status: team.status,
      leaderId: team.leaderId._id.toString(),
      leader: {
        _id: team.leaderId._id.toString(),
        firstName: team.leaderId.firstName || '',
        lastName: team.leaderId.lastName || '',
        email: team.leaderId.email,
        institution: team.leaderId.institution || '',
        country: team.leaderId.country || ''
      },
      members: team.members.map((member: TeamMember) => ({
        userId: member.user._id.toString(),
        firstName: member.user.firstName || '',
        lastName: member.user.lastName || '',
        email: member.user.email,
        teamRole: member.teamRole,
        institution: member.user.institution || '',
        country: member.user.country || '',
        joinedAt: member.joinedAt
      })),
      createdAt: team.createdAt.toISOString()
    };

    return NextResponse.json({
      message: 'Team created successfully',
      team: transformedTeam
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware } from '@/middleware/adminMiddleware'; 