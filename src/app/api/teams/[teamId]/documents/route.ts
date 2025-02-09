import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import { Document } from '@/models/Document';
import { z } from 'zod';
import { ITeamMember } from '@/types/models';

// GET /api/teams/[teamId]/documents
export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is a member of the team
    const isMember = team.members.some((member: ITeamMember) => 
      member.user.toString() === session.user.id
    );
    const isLeader = team.leader.toString() === session.user.id;

    if (!isMember && !isLeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await Document.find({ teamId: params.teamId })
      .populate('uploadedBy', 'firstName lastName')
      .populate('owner', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[teamId]/documents
export async function POST(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is a member of the team
    const isMember = team.members.some((member: ITeamMember) => 
      member.user.toString() === session.user.id
    );
    const isLeader = team.leader.toString() === session.user.id;

    if (!isMember && !isLeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create document record
    const document = await Document.create({
      name: file.name,
      type: file.type,
      size: file.size,
      teamId: params.teamId,
      uploadedBy: session.user.id,
      owner: session.user.id,
      title: file.name,
      description: `Uploaded by ${session.user.firstName} ${session.user.lastName}`,
      visibility: 'team',
      team: params.teamId,
      version: 1,
      lastModified: new Date(),
      history: [{
        editor: session.user.id,
        timestamp: new Date(),
        changes: 'Initial upload'
      }]
    });

    // TODO: Implement file storage logic (e.g., upload to S3)
    // For now, we'll just return the document metadata

    await document.populate([
      { path: 'uploadedBy', select: 'firstName lastName' },
      { path: 'owner', select: 'firstName lastName' }
    ]);

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId]/documents/[documentId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { teamId: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const team = await Team.findById(params.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is a member of the team
    const isMember = team.members.some((member: ITeamMember) => 
      member.user.toString() === session.user.id
    );
    const isLeader = team.leader.toString() === session.user.id;

    if (!isMember && !isLeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await Document.findOne({
      _id: params.documentId,
      teamId: params.teamId,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete
    if (document.owner.toString() !== session.user.id && !isLeader) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this document' },
        { status: 401 }
      );
    }

    await Document.findByIdAndDelete(params.documentId);

    // TODO: Implement file deletion logic (e.g., delete from S3)

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 