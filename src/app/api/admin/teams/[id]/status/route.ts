import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { adminGuard } from '@/lib/auth/adminGuard';
import { z } from 'zod';
import { Types } from 'mongoose';

interface TeamMember {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  institution?: string;
  country?: string;
  teamRole?: string;
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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    await connectDB();

    const team = await Team.findByIdAndUpdate(
      params.id,
      { $set: { status: validatedData.status } },
      { new: true }
    )
    .populate('members', 'firstName lastName email institution country teamRole')
    .populate('leaderId', 'firstName lastName email');

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedTeam = {
      _id: team._id.toString(),
      name: team.name,
      status: team.status,
      leaderId: team.leaderId._id.toString(),
      members: team.members.map((member: TeamMember) => ({
        _id: member._id.toString(),
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email,
        institution: member.institution,
        country: member.country,
        teamRole: member.teamRole
      })),
      createdAt: team.createdAt.toISOString()
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

// Apply admin middleware to all routes
export { adminMiddleware as middleware } from '@/middleware/adminMiddleware'; 