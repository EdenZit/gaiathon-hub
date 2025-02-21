import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/tokens';
import { Types } from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const { userId, valid } = await verifyToken(token);
    
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(new Types.ObjectId(userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    user.emailVerified = true;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 