import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { adminGuard } from '@/lib/auth/adminGuard';
import { z } from 'zod';

const updateProfileSchema = z.object({
  institution: z.string().optional(),
  yearOfStudy: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  teamRole: z.enum(['leader', 'member']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  country: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'update_user_profile');
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    console.log('Received update data:', body);

    const validatedData = updateProfileSchema.parse(body);
    console.log('Validated data:', validatedData);

    await connectDB();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      params.userId,
      { $set: validatedData },
      { 
        new: true, 
        runValidators: true,
        lean: true // Return a plain JavaScript object
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
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        institution: updatedUser.institution,
        yearOfStudy: updatedUser.yearOfStudy,
        fieldOfStudy: updatedUser.fieldOfStudy,
        teamRole: updatedUser.teamRole,
        gender: updatedUser.gender,
        country: updatedUser.country
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 