import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TeamService } from '@/lib/services/team.service';

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

    const team = await TeamService.processInvitation(
      params.invitationId,
      session.user.id
    );

    return NextResponse.json({
      message: 'Successfully joined team',
      team,
    });
  } catch (error) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process invitation' },
      { status: 400 }
    );
  }
} 