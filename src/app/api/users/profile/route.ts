import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Schema for profile update validation
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  institution: z.string().min(1, 'Institution is required'),
  department: z.string().nullable(),
  location: z.string().nullable(),
  contactInfo: z.string().nullable(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  yearOfStudy: z.string().min(1, 'Year of study is required'),
  country: z.string().min(1, 'Country is required'),
  previousHackathonExperience: z.string(),
  githubUrl: z.string().optional(),
  personalWebsite: z.string().optional(),
  linkedinUrl: z.string().optional(),
  teamRole: z.enum(['leader', 'member']).default('member'),
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

      // Update the user with findOneAndUpdate
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        {
          $set: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            fullName: `${validatedData.firstName} ${validatedData.lastName}`,
            institution: validatedData.institution,
            department: validatedData.department,
            location: validatedData.location,
            contactInfo: validatedData.contactInfo,
            bio: validatedData.bio,
            phoneNumber: validatedData.phoneNumber,
            fieldOfStudy: validatedData.fieldOfStudy,
            yearOfStudy: validatedData.yearOfStudy,
            country: validatedData.country,
            previousHackathonExperience: validatedData.previousHackathonExperience,
            githubUrl: validatedData.githubUrl,
            personalWebsite: validatedData.personalWebsite,
            linkedinUrl: validatedData.linkedinUrl,
            teamRole: validatedData.teamRole,
            techSkills: validatedData.techSkills || {
              coding: false,
              remoteSensing: false,
              gis: false,
              iot: false,
              other: '',
            },
          }
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
          upsert: false, // Don't create if not exists
        }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Profile updated successfully',
        profileCompleted: updatedUser.profileCompleted,
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
          previousHackathonExperience: updatedUser.previousHackathonExperience,
          githubUrl: updatedUser.githubUrl,
          personalWebsite: updatedUser.personalWebsite,
          linkedinUrl: updatedUser.linkedinUrl,
          teamRole: updatedUser.teamRole,
          techSkills: updatedUser.techSkills,
          profileCompleted: updatedUser.profileCompleted,
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