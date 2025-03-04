import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/lib/db/models/Team';
import { User } from '@/lib/db/models/User';
import { z } from 'zod';
import { Types } from 'mongoose';
import { createInitialTeamMembers, createTeamMemberObject, transformTeamMemberForResponse } from '@/lib/utils/team-utils';
import { IUser } from '@/types/models';

const TEAM_CATEGORIES = [
  'Digital Platforms and Interactive Applications',
  'IoT-Enabled Smart Systems',
  'Geospatial Intelligence and Policy Innovation'
] as const;

const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  category: z.enum(TEAM_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid team category' })
  }),
  memberEmails: z.array(z.string().email('Invalid email format')).optional()
});

interface UpdatedUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  teamRole: 'leader' | 'member';
  status: 'active' | 'inactive';
}

interface TeamMember {
  user: {
    _id: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    institution?: string;
    country?: string;
  };
  teamRole: string;
  joinedAt: Date;
}

interface PopulatedTeam {
  _id: Types.ObjectId;
  name: string;
  category: string;
  status: string;
  leaderId: {
    _id: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    institution?: string;
    country?: string;
  };
  members: TeamMember[];
  createdAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all teams where the user is either a leader or a member
    const rawTeams = await Team.find({
      $or: [
        { leaderId: user._id },
        { 'members.user': user._id }
      ]
    })
    .populate('leaderId', 'firstName lastName email institution country')
    .populate('members.user', 'firstName lastName email institution country')
    .sort({ createdAt: -1 })
    .lean();

    // Type assertion after validation
    const teams = rawTeams as unknown as PopulatedTeam[];

    // Transform teams to include full member details
    const transformedTeams = teams.map(team => ({
      _id: team._id,
      name: team.name,
      category: team.category,
      status: team.status,
      leaderId: team.leaderId._id,
      leader: {
        _id: team.leaderId._id,
        firstName: team.leaderId.firstName || '',
        lastName: team.leaderId.lastName || '',
        email: team.leaderId.email,
        institution: team.leaderId.institution || '',
        country: team.leaderId.country || ''
      },
      members: team.members.map((member: TeamMember) => ({
        userId: member.user._id,
        firstName: member.user.firstName || '',
        lastName: member.user.lastName || '',
        email: member.user.email,
        teamRole: member.teamRole,
        institution: member.user.institution || '',
        country: member.user.country || '',
        joinedAt: member.joinedAt
      })),
      createdAt: team.createdAt
    }));

    return NextResponse.json(transformedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean() as IUser | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has completed their profile
    if (!user.profileCompleted) {
      return NextResponse.json(
        { error: 'You must complete your profile before creating a team' },
        { status: 400 }
      );
    }

    // Check if user has the team_leader role
    if ((user as any).role !== 'team_leader') {
      return NextResponse.json(
        { error: 'Only Team Leaders can create teams' },
        { status: 403 }
      );
    }

    // Check if user is already a team leader of an active team
    const existingTeam = await Team.findOne({
      leaderId: user._id,
      status: { $ne: 'rejected' }
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You cannot create another team while you are a team leader' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { name, category, memberEmails = [] } = data;

    // Validate the data
    const validationResult = createTeamSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid team data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Create initial team with leader
    const members = await createInitialTeamMembers(user._id.toString());

    // Create the team
    const team = await Team.create({
      name,
      category,
      leaderId: user._id,
      members
    });

    // Process additional members if any
    if (memberEmails.length > 0) {
      console.log('Member emails to add:', memberEmails);
      
      for (const email of memberEmails) {
        try {
          const memberObj = await createTeamMemberObject({
            email,
            teamRole: 'member'
          });
          
          await Team.findByIdAndUpdate(team._id, {
            $push: { members: memberObj }
          });
        } catch (error) {
          console.warn(`Failed to add member ${email}:`, error);
          // Continue with other members even if one fails
        }
      }
    }

    // Fetch the updated team with populated members
    const updatedTeam = await Team.findById(team._id)
      .populate('leaderId', 'firstName lastName email institution country')
      .populate('members.user', 'firstName lastName email institution country');

    if (!updatedTeam) {
      throw new Error('Failed to fetch updated team');
    }

    return NextResponse.json({
      ...updatedTeam.toObject(),
      members: updatedTeam.members.map(transformTeamMemberForResponse)
    });

  } catch (error) {
    console.warn('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
} 