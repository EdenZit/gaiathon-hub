import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        details: [
          { field: 'email', message: 'Please provide your email address' }
        ]
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Check if user exists - convert email to lowercase to match schema
    const normalizedEmail = email.toLowerCase();
    console.log(`Looking for user with email: ${normalizedEmail}`);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log(`User not found with email: ${normalizedEmail}`);
      // For security reasons, don't reveal that the user doesn't exist
      // Instead, return a success message as if the process worked
      return NextResponse.json({ 
        message: 'If an account with that email exists, you will be redirected to answer your security question.' 
      });
    }
    
    console.log(`User found: ${user.email}`);
    console.log(`Security question exists: ${!!user.securityQuestion}`);
    if (user.securityQuestion) {
      console.log(`Question exists: ${!!user.securityQuestion.question}`);
      console.log(`Answer exists: ${!!user.securityQuestion.answer}`);
    }
    
    // Check if user has set up a security question
    if (!user.securityQuestion || !user.securityQuestion.question || !user.securityQuestion.answer) {
      return NextResponse.json({ 
        error: 'No security question has been set up for this account. Please contact support.' 
      }, { status: 400 });
    }
    
    // Return success with the user's security question (but not the answer)
    return NextResponse.json({ 
      message: 'Security question found',
      securityQuestion: user.securityQuestion.question
    });
    
  } catch (error) {
    console.error('Error in forgot password process:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 