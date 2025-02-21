import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/db/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(params.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Toggle email verification status
    user.emailVerified = !user.emailVerified;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      emailVerified: user.emailVerified 
    });
  } catch (error) {
    console.error('Error updating email verification:', error);
    return NextResponse.json(
      { error: 'Failed to update email verification status' },
      { status: 500 }
    );
  }
} 