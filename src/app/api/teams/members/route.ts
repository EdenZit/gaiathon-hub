import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';

// Schema for member data validation
const memberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['leader', 'member']),
  permissions: z.object({
    canManageMembers: z.boolean(),
    canManageDocuments: z.boolean(),
    canManageProjects: z.boolean(),
    canApproveProgress: z.boolean(),
  }),
});

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

    // Find the team where the user is a member
    const team = await Team.findOne({
      'members.userId': session.user.id,
    }).populate('members.userId', 'name email');

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Format member data
    const members = team.members.map((member: any) => ({
      _id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      role: member.role,
      joinedAt: member.joinedAt,
      permissions: member.permissions,
      performance: member.performance,
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the team where the user is a leader
    const team = await Team.findOne({
      'members.userId': session.user.id,
      'members.role': 'leader',
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Not authorized to add members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = memberSchema.parse(body);

    // Check if user exists
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const isMember = team.members.some(
      (member: any) => member.userId.toString() === user._id.toString()
    );
    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Add new member
    team.members.push({
      userId: user._id,
      role: validatedData.role,
      permissions: validatedData.permissions,
      joinedAt: new Date(),
      performance: {
        tasksCompleted: 0,
        tasksInProgress: 0,
        avgCompletionTime: 0,
      },
    });

    await team.save();

    // Add activity log
    team.activity.unshift({
      type: 'team',
      action: `Added ${user.name} as a team ${validatedData.role}`,
      details: {
        user: {
          name: session.user.name || '',
          id: session.user.id,
        },
        target: user.name,
      },
      timestamp: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: 'Member added successfully',
      member: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: validatedData.role,
        permissions: validatedData.permissions,
        joinedAt: new Date(),
        performance: {
          tasksCompleted: 0,
          tasksInProgress: 0,
          avgCompletionTime: 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid member data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the team where the user is a leader
    const team = await Team.findOne({
      'members.userId': session.user.id,
      'members.role': 'leader',
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Not authorized to update members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberId, ...updateData } = body;
    const validatedData = memberSchema.parse(updateData);

    // Update member
    const memberIndex = team.members.findIndex(
      (member: any) => member.userId.toString() === memberId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Don't allow updating own role/permissions
    if (memberId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot update own role/permissions' },
        { status: 400 }
      );
    }

    team.members[memberIndex] = {
      ...team.members[memberIndex],
      role: validatedData.role,
      permissions: validatedData.permissions,
    };

    await team.save();

    // Add activity log
    team.activity.unshift({
      type: 'team',
      action: `Updated team member permissions`,
      details: {
        user: {
          name: session.user.name || '',
          id: session.user.id,
        },
        target: team.members[memberIndex].userId.name,
      },
      timestamp: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: 'Member updated successfully',
      member: team.members[memberIndex],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid member data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const memberId = url.searchParams.get('id');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the team where the user is a leader
    const team = await Team.findOne({
      'members.userId': session.user.id,
      'members.role': 'leader',
    }).populate('members.userId', 'name');

    if (!team) {
      return NextResponse.json(
        { error: 'Not authorized to remove members' },
        { status: 403 }
      );
    }

    // Don't allow removing self
    if (memberId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove self from team' },
        { status: 400 }
      );
    }

    const memberIndex = team.members.findIndex(
      (member: any) => member.userId._id.toString() === memberId
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const removedMember = team.members[memberIndex];
    team.members.splice(memberIndex, 1);

    // Add activity log
    team.activity.unshift({
      type: 'team',
      action: 'Removed team member',
      details: {
        user: {
          name: session.user.name || '',
          id: session.user.id,
        },
        target: removedMember.userId.name,
      },
      timestamp: new Date(),
    });

    await team.save();

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 