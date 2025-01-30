import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Document } from '@/models/Document';
import { User } from '@/lib/db/models/User';
import { Types } from 'mongoose';

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
    const { userIds } = await request.json();

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'User IDs must be an array' },
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

    // Verify all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: 'One or more users not found' },
        { status: 404 }
      );
    }

    // Add users to collaborators and remove duplicates
    document.collaborators = Array.from(new Set([...document.collaborators, ...userIds]));
    await document.save();

    // Populate document details for response
    await document.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'team', select: 'name' },
      { path: 'collaborators', select: 'firstName lastName email' }
    ]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error adding collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to add collaborators' },
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
    const { userIds } = await request.json();

    if (!Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'User IDs must be an array' },
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

    // Cannot remove document owner from collaborators
    if (userIds.includes(document.owner.toString())) {
      return NextResponse.json(
        { error: 'Cannot remove document owner from collaborators' },
        { status: 400 }
      );
    }

    // Remove users from collaborators
    document.collaborators = document.collaborators.filter(
      (collaboratorId: Types.ObjectId) => !userIds.includes(collaboratorId.toString())
    );
    await document.save();

    // Populate document details for response
    await document.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'team', select: 'name' },
      { path: 'collaborators', select: 'firstName lastName email' }
    ]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error removing collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborators' },
      { status: 500 }
    );
  }
} 