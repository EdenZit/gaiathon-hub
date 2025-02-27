import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { Types } from 'mongoose';

interface TeamMember {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  name?: string;
}

interface RawTeamDocument {
  _id: Types.ObjectId;
  name: string;
  category: string;
  leaderId: Types.ObjectId;
  members: {
    user: {
      _id: Types.ObjectId;
      firstName?: string;
      lastName?: string;
      email: string;
      name?: string;
    };
    teamRole: 'leader' | 'member';
    joinedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Team Fetch] Searching for team with user:', {
      userId: session.user.id,
      email: session.user.email,
      teamRole: session.user.teamRole
    });

    await connectDB();

    // Ensure valid ObjectId
    let userId;
    try {
      userId = new Types.ObjectId(session.user.id);
    } catch (error) {
      console.error('[Team Fetch] Invalid user ID format:', session.user.id);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Log the query we're about to make
    const query = {
      $or: [
        { leaderId: userId },
        { 'members.user': userId }
      ]
    };
    console.log('[Team Fetch] MongoDB query:', JSON.stringify(query));

    // Find team where user is either leader or member
    const rawTeam = await Team.findOne(query)
      .populate('members.user', 'email firstName lastName name')
      .lean() as RawTeamDocument | null;

    // Log the raw result before transformation
    if (rawTeam) {
      const isLeader = rawTeam.leaderId.toString() === session.user.id;
      console.log('[Team Fetch] Raw team found:', {
        _id: rawTeam._id.toString(),
        name: rawTeam.name,
        leaderId: rawTeam.leaderId.toString(),
        currentUserId: session.user.id,
        isLeader,
        members: rawTeam.members.map(m => ({
          userId: m.user._id.toString(),
          email: m.user.email,
          teamRole: m.teamRole
        }))
      });

      // Double check that the user's role matches their position in the team
      if (isLeader && session.user.teamRole !== 'leader') {
        console.warn('[Team Fetch] User is team leader but role is not set correctly:', {
          userId: session.user.id,
          currentRole: session.user.teamRole,
          teamId: rawTeam._id.toString()
        });
      }
    } else {
      // Log a more detailed message about why no team was found
      console.log('[Team Fetch] No team found. Verifying user session:', {
        userId: session.user.id,
        email: session.user.email,
        teamRole: session.user.teamRole,
        query: JSON.stringify(query)
      });
    }

    if (!rawTeam) {
      // Return a 200 status with null team instead of 404
      return NextResponse.json({ team: null });
    }

    console.log('[Team Fetch] Found team:', {
      teamId: rawTeam._id.toString(),
      name: rawTeam.name,
      memberCount: rawTeam.members?.length || 0
    });

    // Transform the data to ensure consistent structure
    const transformedTeam = {
      ...rawTeam,
      _id: rawTeam._id.toString(),
      leaderId: rawTeam.leaderId.toString(),
      isLeader: rawTeam.leaderId.toString() === session.user.id,
      members: rawTeam.members.map(member => ({
        ...member,
        user: {
          ...member.user,
          _id: member.user._id.toString()
        }
      }))
    };

    return NextResponse.json({ team: transformedTeam });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
} 