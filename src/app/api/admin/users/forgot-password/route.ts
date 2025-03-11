import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Verify admin status
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const { email, newPassword, reason } = await req.json();
    
    // Validate inputs
    if (!email || !newPassword) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: [
          { field: 'email', message: 'Email is required' },
          { field: 'newPassword', message: 'New password is required' }
        ]
      }, { status: 400 });
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }
    
    // Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    user.password = hashedPassword;
    
    // Add a note about the admin reset
    if (!user.adminNotes) {
      user.adminNotes = [];
    }
    
    user.adminNotes.push({
      adminEmail: session.user.email,
      action: 'password_reset',
      reason: reason || 'User forgot password and security question',
      timestamp: new Date()
    });
    
    await user.save();
    
    // Log the action
    console.log(`Admin ${session.user.email} reset password for user ${user.email} due to forgotten password`);
    
    return NextResponse.json({ 
      message: 'Password reset successfully by admin' 
    });
    
  } catch (error) {
    console.error('Error in admin password reset:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 