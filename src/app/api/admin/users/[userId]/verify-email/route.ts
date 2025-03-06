import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    // Use direct MongoDB operations to avoid model issues
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    const usersCollection = db.collection('users');
    
    // Find the user
    const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(params.userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Toggle the emailVerified status
    const currentStatus = user.emailVerified || false;
    const newStatus = !currentStatus;
    
    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(params.userId) },
      { $set: { emailVerified: newStatus } }
    );

    console.log(`Email verification status updated for user ${params.userId} to ${newStatus}`);

    return NextResponse.json({
      message: `Email ${newStatus ? 'verified' : 'unverified'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        emailVerified: newStatus
      }
    });
  } catch (error) {
    console.error('Error updating email verification status:', error);
    return NextResponse.json(
      { error: 'Failed to update email verification status' },
      { status: 500 }
    );
  }
} 