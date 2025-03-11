import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/connection';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

// GET endpoint to retrieve a user's security question (without the answer)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email }).select('securityQuestion');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return only the question, not the answer
    return NextResponse.json({ 
      securityQuestion: user.securityQuestion ? user.securityQuestion.question : null 
    });
    
  } catch (error) {
    console.error('Error retrieving security question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT endpoint to update a user's security question
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { question, answer, currentPassword } = await req.json();
    
    // Validate inputs
    if (!question || !answer || !currentPassword) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: [
          { field: 'question', message: 'Security question is required' },
          { field: 'answer', message: 'Security answer is required' },
          { field: 'currentPassword', message: 'Current password is required' }
        ]
      }, { status: 400 });
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    
    // Update security question
    user.securityQuestion = {
      question,
      answer: answer.toLowerCase().trim() // Store answer in lowercase for case-insensitive comparison later
    };
    
    await user.save();
    
    return NextResponse.json({ 
      message: 'Security question updated successfully',
      securityQuestion: { question: user.securityQuestion.question }
    });
    
  } catch (error) {
    console.error('Error updating security question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 