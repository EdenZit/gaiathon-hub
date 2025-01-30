import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const memberId = params.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Check if member already exists
    if (team.members.some(member => member.user.toString() === memberId)) {
      return NextResponse.json({ error: 'Member already exists in team' }, { status: 400 });
    }

    // Add new member with default permissions
    team.members.push({
      user: new mongoose.Types.ObjectId(memberId),
      role: 'member',
      joinedAt: new Date(),
      permissions: {
        canManageMembers: false,
        canManageDocuments: false,
        canManageProjects: false,
        canApproveProgress: false
      }
    });

    await team.save();
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

    return NextResponse.json({ message: 'Member added successfully', team: transformedTeam });
  } catch (error: any) {
    console.error('Error adding team member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; memberId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const memberId = params.memberId;
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Check if member is the team leader
    const leaderMember = team.members.find(member => 
      member.user.toString() === memberId && member.role === 'leader'
    );

    if (leaderMember) {
      return NextResponse.json({ error: 'Cannot remove team leader' }, { status: 400 });
    }

    // Remove member
    team.members = team.members.filter(member => member.user.toString() !== memberId);
    await team.save();
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

    return NextResponse.json({ message: 'Member removed successfully', team: transformedTeam });
  } catch (error: any) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 