import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: email.toLowerCase() }).select('securityQuestion');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.securityQuestion || !user.securityQuestion.question) {
      return NextResponse.json({ 
        error: 'No security question set for this account. Please contact support.' 
      }, { status: 400 });
    }
    
    // Return only the question, not the answer
    return NextResponse.json({ 
      securityQuestion: user.securityQuestion.question 
    });
    
  } catch (error) {
    console.error('Error fetching security question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 