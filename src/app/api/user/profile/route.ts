import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Schema for profile update validation
const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  institution: z.string().min(1, 'Institution is required'),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  gaiaClubName: z.string().min(1, 'GAIA Club name is required'),
  gaiaClubRole: z.string().min(1, 'GAIA Club role is required'),
  teamJoiningPreference: z.enum(['invite', 'request']),
  contactInfo: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fullName: user.fullName || '',
      institution: user.institution || '',
      department: user.department || '',
      location: user.location || '',
      gaiaClubName: user.gaiaClubName || '',
      gaiaClubRole: user.gaiaClubRole || '',
      teamJoiningPreference: user.teamJoiningPreference || 'invite',
      contactInfo: user.contactInfo || '',
      bio: user.bio || '',
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    console.log('Received profile update data:', body);

    const validatedData = profileSchema.parse(body);
    console.log('Validated data:', validatedData);

    // First find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user fields
    user.fullName = validatedData.fullName;
    user.institution = validatedData.institution;
    user.department = validatedData.department || undefined;
    user.location = validatedData.location || undefined;
    user.gaiaClubName = validatedData.gaiaClubName;
    user.gaiaClubRole = validatedData.gaiaClubRole;
    user.teamJoiningPreference = validatedData.teamJoiningPreference;
    user.contactInfo = validatedData.contactInfo || undefined;
    user.bio = validatedData.bio || undefined;

    // Save the user to trigger the pre-save hooks
    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 