import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { adminGuard } from '@/lib/auth/adminGuard';
import { Types, Document } from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  teamRole: 'leader' | 'member';
  institution?: string;
  country?: string;
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

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'fetch_teams');
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Connect to MongoDB Atlas
    await connectDB();
    console.log('Connected to MongoDB Atlas for team fetch');

    // Fetch all teams with populated member data
    const teamsData = await Team.find({})
      .populate('members', 'firstName lastName email teamRole institution country')
      .sort({ createdAt: -1 })
      .lean();

    // Type assertion after fetching
    const teams = teamsData as unknown as DBTeam[];

    if (!teams || teams.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    // Transform the teams data for the frontend
    const transformedTeams: TransformedTeam[] = teams.map(team => ({
      _id: team._id.toString(),
      name: team.name,
      category: team.category,
      status: team.status,
      members: team.members.map(member => ({
        _id: member._id.toString(),
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email,
        teamRole: member.teamRole || 'member',
        institution: member.institution || '',
        country: member.country || ''
      })),
      createdAt: team.createdAt.toISOString()
    }));

    return NextResponse.json({ teams: transformedTeams });
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
      members: [new Types.ObjectId(leaderId)],
      status: 'pending'
    });

    await team.save();
    await team.populate('members', 'firstName lastName email institution country');
    await team.populate('leaderId', 'firstName lastName email');

    const transformedTeam = {
      _id: team._id.toString(),
      name: team.name,
      status: team.status,
      leaderId: team.leaderId._id.toString(),
      members: team.members.map(member => ({
        _id: member._id.toString(),
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email,
        teamRole: member.teamRole || 'member',
        institution: member.institution,
        country: member.country,
        teamRole: member.teamRole
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