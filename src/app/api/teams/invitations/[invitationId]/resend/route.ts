import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TeamService } from '@/lib/services/team.service';
import { Invitation } from '@/models/Invitation';
import { Team } from '@/models/Team';

export async function POST(
  request: Request,
  { params }: { params: { invitationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the invitation
    const invitation = await Invitation.findById(params.invitationId);
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to resend (must be team leader or original inviter)
    const team = await Team.findById(invitation.teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const isTeamLeader = team.leader.toString() === session.user.id;
    const isInviter = invitation.invitedBy.toString() === session.user.id;

    if (!isTeamLeader && !isInviter) {
      return NextResponse.json(
        { error: 'Not authorized to resend this invitation' },
        { status: 403 }
      );
    }

    await TeamService.resendInvitation(params.invitationId);

    return NextResponse.json({
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resend invitation' },
      { status: 400 }
    );
  }
} 