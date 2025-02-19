import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find team where user is either leader or member
    const team = await Team.findOne({
      $or: [
        { leaderId: new Types.ObjectId(session.user.id) },
        { members: new Types.ObjectId(session.user.id) }
      ]
    }).populate('members', 'email firstName lastName name')
      .populate('leaderId', 'email firstName lastName name');

    if (!team) {
      return NextResponse.json(
        { message: 'No team found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
} 