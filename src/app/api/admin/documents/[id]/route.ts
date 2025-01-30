import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Document } from '@/models/Document';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    const document = await Document.findById(id)
      .populate('owner', 'firstName lastName email')
      .populate('team', 'name')
      .populate('collaborators', 'firstName lastName email');

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { title, description, type, visibility, teamId } = await request.json();

    if (!title || !description || !type || !visibility) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    await connectDB();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if new title conflicts with existing document
    if (title !== document.title) {
      const existingDocument = await Document.findOne({ title });
      if (existingDocument) {
        return NextResponse.json(
          { error: 'Document with this title already exists' },
          { status: 400 }
        );
      }
    }

    // Update document
    document.title = title;
    document.description = description;
    document.type = type;
    document.visibility = visibility;
    
    // Handle team association
    if (visibility === 'team') {
      if (!teamId) {
        return NextResponse.json(
          { error: 'Team ID is required for team visibility' },
          { status: 400 }
        );
      }
      document.team = teamId;
    } else {
      document.team = undefined;
    }

    await document.save();

    // Populate document details for response
    await document.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'team', select: 'name' },
      { path: 'collaborators', select: 'firstName lastName email' }
    ]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    await document.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 
