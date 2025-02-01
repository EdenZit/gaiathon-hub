import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { AdminTeamQuery, ApiError, PaginatedResponse } from '@/types/admin';
import { ITeam } from '@/types/models';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query: AdminTeamQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE)),
      search: searchParams.get('search') || undefined,
      leader: searchParams.get('leader') || undefined,
      status: (searchParams.get('status') as AdminTeamQuery['status']) || 'active'
    };

    // Build MongoDB query
    const mongoQuery: Record<string, unknown> = {};
    
    if (query.leader) {
      mongoQuery.leader = query.leader;
    }
    
    if (query.status) {
      mongoQuery.status = query.status;
    }
    
    if (query.search) {
      mongoQuery.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const total = await Team.countDocuments(mongoQuery);
    const pages = Math.ceil(total / query.limit!);
    const skip = (query.page! - 1) * query.limit!;

    const teams = await Team.find(mongoQuery)
      .populate('leader members', 'firstName lastName email')
      .skip(skip)
      .limit(query.limit!)
      .sort({ createdAt: -1 });

    const response: PaginatedResponse<ITeam> = {
      data: teams,
      pagination: {
        page: query.page!,
        limit: query.limit!,
        total,
        pages
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error fetching teams:', apiError);
    return NextResponse.json(
      { error: apiError.message || 'Failed to fetch teams' },
      { status: apiError.status || 500 }
    );
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