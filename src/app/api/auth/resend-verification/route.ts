import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/db/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { generateVerificationToken } from '@/lib/auth/tokens';
import { Types } from 'mongoose';

interface UserDocument {
  _id: Types.ObjectId;
  email: string;
  emailVerified: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email }) as UserDocument | null;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    const token = await generateVerificationToken(user._id.toString());
    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 