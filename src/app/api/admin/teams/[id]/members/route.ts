import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { memberIds } = await request.json();

    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Add new members
    const newMembers = memberIds.map(userId => ({
      user: userId,
      role: 'member' as const,
      joinedAt: new Date(),
      permissions: {
        canManageMembers: false,
        canManageDocuments: false,
        canManageProjects: false,
        canApproveProgress: false
      }
    }));

    team.members.push(...newMembers);
    await team.save();

    await team.populate('members.user', 'name email');

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error adding team members:', error);
    return NextResponse.json(
      { error: 'Failed to add team members' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, memberId } = params;

    await connectDB();

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Prevent removing the team leader
    const member = team.members.find(m => m.user.toString() === memberId);
    if (member?.role === 'leader') {
      return NextResponse.json(
        { error: 'Cannot remove team leader' },
        { status: 400 }
      );
    }

    team.members = team.members.filter(m => m.user.toString() !== memberId);
    await team.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
} 
