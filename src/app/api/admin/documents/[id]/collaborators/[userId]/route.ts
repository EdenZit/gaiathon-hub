import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Document } from '@/lib/db/models/Document';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findById(params.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if collaborator already exists
    if (document.collaborators.some(id => id.toString() === userId)) {
      return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
    }

    // Add new collaborator
    document.collaborators.push(new mongoose.Types.ObjectId(userId));
    await document.save();
    await document.populate('owner collaborators', 'name email');

    return NextResponse.json({ message: 'Collaborator added successfully', document });
  } catch (error: any) {
    console.error('Error adding document collaborator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const document = await Document.findById(params.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const userId = params.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user is a collaborator
    if (!document.collaborators.some(id => id.toString() === userId)) {
      return NextResponse.json({ error: 'User is not a collaborator' }, { status: 400 });
    }

    // Remove collaborator
    document.collaborators = document.collaborators.filter(id => id.toString() !== userId);
    await document.save();
    await document.populate('owner collaborators', 'name email');

    return NextResponse.json({ message: 'Collaborator removed successfully', document });
  } catch (error: any) {
    console.error('Error removing document collaborator:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 