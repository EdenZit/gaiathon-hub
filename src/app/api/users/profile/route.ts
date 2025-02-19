import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/db/models/User';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Schema for profile update validation
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  institution: z.string().optional(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  contactInfo: z.string().nullable(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  fieldOfStudy: z.string().optional(),
  yearOfStudy: z.string().optional(),
  country: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  previousHackathonExperience: z.string().optional(),
  githubUrl: z.string().optional(),
  personalWebsite: z.string().optional(),
  linkedinUrl: z.string().optional(),
  teamRole: z.enum(['leader', 'member']).optional(),
  techSkills: z.object({
    coding: z.boolean(),
    remoteSensing: z.boolean(),
    gis: z.boolean(),
    iot: z.boolean(),
    other: z.string().optional()
  }).optional()
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

    // Return all user fields
    return NextResponse.json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      institution: user.institution || '',
      department: user.department || null,
      location: user.location || null,
      contactInfo: user.contactInfo || null,
      bio: user.bio || null,
      phoneNumber: user.phoneNumber || null,
      fieldOfStudy: user.fieldOfStudy || '',
      yearOfStudy: user.yearOfStudy || '',
      country: user.country || '',
      gender: user.gender || '',
      previousHackathonExperience: user.previousHackathonExperience || '',
      githubUrl: user.githubUrl || '',
      personalWebsite: user.personalWebsite || '',
      linkedinUrl: user.linkedinUrl || '',
      teamRole: user.teamRole || 'member',
      techSkills: user.techSkills || {
        coding: false,
        remoteSensing: false,
        gis: false,
        iot: false,
        other: '',
      },
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

    try {
      const validatedData = profileSchema.parse(body);
      console.log('Validated data:', validatedData);

      // Prepare update data
      const updateData: any = { ...validatedData };
      
      // Only update name if both firstName and lastName are provided
      if (validatedData.firstName && validatedData.lastName) {
        updateData.name = `${validatedData.firstName} ${validatedData.lastName}`;
      }

      // Remove email from update if it matches current email
      if (updateData.email === session.user.email) {
        delete updateData.email;
      }

      console.log('Final update data:', updateData);

      // Update the user
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          lean: true
        }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('Updated user:', updatedUser);

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          institution: updatedUser.institution,
          department: updatedUser.department,
          location: updatedUser.location,
          contactInfo: updatedUser.contactInfo,
          bio: updatedUser.bio,
          phoneNumber: updatedUser.phoneNumber,
          fieldOfStudy: updatedUser.fieldOfStudy,
          yearOfStudy: updatedUser.yearOfStudy,
          country: updatedUser.country,
          gender: updatedUser.gender,
          previousHackathonExperience: updatedUser.previousHackathonExperience,
          githubUrl: updatedUser.githubUrl,
          personalWebsite: updatedUser.personalWebsite,
          linkedinUrl: updatedUser.linkedinUrl,
          teamRole: updatedUser.teamRole,
          techSkills: updatedUser.techSkills,
          profileCompleted: updatedUser.profileCompleted
        }
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors = validationError.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error updating profile:', error);

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