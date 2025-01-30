import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const leaderId = searchParams.get('leaderId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query = leaderId ? { leader: leaderId } : {};
    const teams = await Team.find(query)
      .populate('leader', 'name email')
      .populate('members.user', 'name email')
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform response to match expected format
    const transformedTeams = teams.map(team => ({
      ...team,
      leaderId: team.leader._id || team.leader,
      members: team.members.map(member => ({
        ...member,
        userId: member.user._id || member.user
      }))
    }));

    const total = await Team.countDocuments(query);

    return NextResponse.json({
      teams: transformedTeams,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, leaderId, members = [] } = body;

    if (!name || !description || !leaderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create team with leader as first member
    const teamData = {
      name,
      description,
      leader: leaderId,
      members: [{
        user: leaderId,
        role: 'leader',
        joinedAt: new Date(),
        permissions: {
          canManageMembers: true,
          canManageDocuments: true,
          canManageProjects: true,
          canApproveProgress: true
        }
      }]
    };

    // Add additional members if provided
    if (members.length > 0) {
      const additionalMembers = members
        .filter((memberId: string) => memberId !== leaderId)
        .map((memberId: string) => ({
          user: memberId,
          role: 'member',
          joinedAt: new Date(),
          permissions: {
            canManageMembers: false,
            canManageDocuments: false,
            canManageProjects: false,
            canApproveProgress: false
          }
        }));
      teamData.members.push(...additionalMembers);
    }

    const team = await Team.create(teamData);
    await team.populate('leader members.user', 'name email');

    // Transform response to match expected format
    const transformedTeam = {
      ...team.toObject(),
      leaderId: team.leader._id || team.leader,
      members: team.members.map(member => ({
        ...member,
        userId: member.user._id || member.user
      }))
    };

    return NextResponse.json({ message: 'Team created successfully', team: transformedTeam });
  } catch (error: any) {
    console.error('Error creating team:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Team name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 