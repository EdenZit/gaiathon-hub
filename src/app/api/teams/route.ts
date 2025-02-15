import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Team } from '@/models/Team';
import { User } from '@/models/User';
import { z } from 'zod';
import { Types } from 'mongoose';

const createTeamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  description: z.string(),
  memberEmails: z.array(z.string().email('Invalid email address')),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find teams where user is either the leader or a member
    const teams = await Team.find({
      $or: [
        { leaderId: session.user.id },
        { members: session.user.id }
      ]
    }).populate('leaderId', 'firstName lastName email');

    // Format the response
    const formattedTeams = teams.map(team => ({
      _id: team._id.toString(),
      name: team.name,
      description: team.description,
      leader: team.leaderId,
      members: team.members,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt
    }));

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.error('POST /api/teams - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Double check user's teamRole from the database
    await connectDB();
    console.log('POST /api/teams - Connected to database');
    
    const user = await User.findById(session.user.id);
    console.log('POST /api/teams - User found:', { 
      userId: session.user.id,
      teamRole: user?.teamRole,
      hasActiveTeam: user?.hasActiveTeam 
    });

    if (!user) {
      console.error('POST /api/teams - User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is a team leader
    if (user.teamRole !== 'leader') {
      console.error('POST /api/teams - User is not a team leader:', user.teamRole);
      return NextResponse.json(
        { error: 'Only team leaders can create teams' },
        { status: 403 }
      );
    }

    // Check if user already has an active team
    if (user.hasActiveTeam) {
      console.error('POST /api/teams - User already has an active team');
      return NextResponse.json(
        { error: 'You already have an active team. Please contact an admin to remove your existing team before creating a new one.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('POST /api/teams - Request body:', body);
    
    const validatedData = createTeamSchema.parse(body);
    console.log('POST /api/teams - Validated data:', validatedData);

    // Check if team name already exists
    const existingTeam = await Team.findOne({ 
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') } 
    });
    
    if (existingTeam) {
      console.log('POST /api/teams - Team name already exists:', {
        attemptedName: validatedData.name,
        existingTeamId: existingTeam._id
      });
      return NextResponse.json(
        { 
          error: 'Team name already exists',
          message: `A team with the name "${validatedData.name}" already exists. Please choose a different name.`
        },
        { status: 400 }
      );
    }

    // Create the team document
    const team = new Team({
      name: validatedData.name,
      description: validatedData.description,
      leaderId: new Types.ObjectId(session.user.id),
      members: [new Types.ObjectId(session.user.id)],
      projects: [],
      documents: [],
      activity: [{
        type: 'member',
        action: 'Team created',
        user: new Types.ObjectId(session.user.id),
        timestamp: new Date(),
        details: {
          teamName: validatedData.name
        }
      }],
      chat: { messages: [] },
      calendar: { events: [] },
      progress: { tasks: [], milestones: [] }
    });

    // Save the team
    await team.save();
    console.log('POST /api/teams - Team created:', team);

    // Update the user's teams array and set hasActiveTeam to true
    const updatedUser = await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { teams: team._id },
      hasActiveTeam: true
    }, { new: true });

    // If member emails are provided, create invitations
    if (validatedData.memberEmails.length > 0) {
      // TODO: Implement member invitation logic
      console.log('POST /api/teams - Member emails to invite:', validatedData.memberEmails);
    }

    const populatedTeam = await Team.findById(team._id).populate('leaderId', 'firstName lastName email');
    console.log('POST /api/teams - Team populated with leader details');

    return NextResponse.json({
      team: populatedTeam,
      user: {
        id: updatedUser._id,
        teamRole: updatedUser.teamRole,
        hasActiveTeam: updatedUser.hasActiveTeam
      }
    });
  } catch (error: any) {
    console.error('POST /api/teams - Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

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

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: Object.values(error.errors).map((err: any) => ({
            path: err.path,
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
} 