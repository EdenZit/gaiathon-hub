import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { adminGuard } from '@/lib/auth/adminGuard';
import { z } from 'zod';
import { Types } from 'mongoose';

interface TeamDocument {
  _id: Types.ObjectId;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  leaderId: {
    _id: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    institution?: string;
    country?: string;
  };
  members: Array<{
    user: {
      _id: Types.ObjectId;
      firstName?: string;
      lastName?: string;
      email: string;
      institution?: string;
      country?: string;
    };
    teamRole: 'leader' | 'member';
    joinedAt: Date;
  }>;
  createdAt: Date;
}

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'update_team_status');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    await connectDB();

    const rawTeam = await Team.findByIdAndUpdate(
      params.id,
      { $set: { status: validatedData.status } },
      { new: true }
    )
    .populate('members.user', 'firstName lastName email institution country')
    .populate('leaderId', 'firstName lastName email institution country')
    .lean();

    if (!rawTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Cast the raw team to our expected document type
    const team = rawTeam as unknown as TeamDocument;

    // Transform the response
    const transformedTeam = {
      _id: team._id.toString(),
      name: team.name,
      category: team.category,
      status: team.status,
      leaderId: team.leaderId._id.toString(),
      leader: team.leaderId ? {
        _id: team.leaderId._id.toString(),
        firstName: team.leaderId.firstName || '',
        lastName: team.leaderId.lastName || '',
        email: team.leaderId.email || '',
        institution: team.leaderId.institution || '',
        country: team.leaderId.country || ''
      } : null,
      members: (team.members || []).map((member) => ({
        _id: member.user._id.toString(),
        firstName: member.user.firstName || '',
        lastName: member.user.lastName || '',
        email: member.user.email || '',
        institution: member.user.institution || '',
        country: member.user.country || '',
        teamRole: member.teamRole || 'member',
        joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString() : new Date().toISOString()
      })),
      createdAt: team.createdAt ? new Date(team.createdAt).toISOString() : new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Team status updated successfully',
      team: transformedTeam
    });

  } catch (error) {
    console.error('Error updating team status:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update team status' },
      { status: 500 }
    );
  }
} 