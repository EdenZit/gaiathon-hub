import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define interface for old user document
interface OldUserDocument extends mongoose.Document {
  email: string;
  password: string;
  securityQuestion?: {
    question?: string;
    answer?: string;
  };
}

// Define a schema for the old User model
const oldUserSchema = new mongoose.Schema({
  email: String,
  password: String,
  securityQuestion: {
    question: String,
    answer: String
  }
});

export async function POST(req: NextRequest) {
  try {
    const { email, securityAnswer: providedSecurityAnswer, newPassword } = await req.json();
    
    // Validate inputs
    if (!email || !providedSecurityAnswer || !newPassword) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: [
          { field: 'email', message: 'Email is required' },
          { field: 'securityAnswer', message: 'Security answer is required' },
          { field: 'newPassword', message: 'New password is required' }
        ]
      }, { status: 400 });
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Find the user in the main User model
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Try to get the security question from the user model
    let securityQuestion;
    let storedSecurityAnswer;
    
    if (user.securityQuestion && user.securityQuestion.question && user.securityQuestion.answer) {
      securityQuestion = user.securityQuestion.question;
      storedSecurityAnswer = user.securityQuestion.answer;
    } else {
      // If not found in the main model, try to get it from the old model
      let OldUser: Model<OldUserDocument>;
      
      try {
        // Try to get the existing model first
        OldUser = mongoose.model<OldUserDocument>('OldUser');
      } catch (error) {
        // If the model doesn't exist, create it
        OldUser = mongoose.model<OldUserDocument>('OldUser', oldUserSchema, 'users');
      }
      
      const oldUser = await OldUser.findOne({ email: email.toLowerCase() });
      
      if (!oldUser || !oldUser.securityQuestion || !oldUser.securityQuestion.question || !oldUser.securityQuestion.answer) {
        return NextResponse.json({ error: 'Security question not set for this account' }, { status: 400 });
      }
      
      securityQuestion = oldUser.securityQuestion.question;
      storedSecurityAnswer = oldUser.securityQuestion.answer;
    }
    
    // Verify security answer (case-insensitive)
    const normalizedProvidedAnswer = providedSecurityAnswer.toLowerCase().trim();
    const normalizedStoredAnswer = storedSecurityAnswer.toLowerCase().trim();
    
    if (normalizedProvidedAnswer !== normalizedStoredAnswer) {
      return NextResponse.json({ error: 'Incorrect security answer' }, { status: 401 });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password in the main User model
    user.password = hashedPassword;
    await user.save();
    
    // Try to update the password in the old model as well
    try {
      const OldUser = mongoose.model<OldUserDocument>('OldUser');
      const oldUser = await OldUser.findOne({ email: email.toLowerCase() });
      
      if (oldUser) {
        oldUser.password = hashedPassword;
        await oldUser.save();
      }
    } catch (error) {
      // Ignore errors with the old model, as long as the main model is updated
      console.log('Error updating old user model:', error);
    }
    
    return NextResponse.json({ 
      message: 'Password reset successfully' 
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 