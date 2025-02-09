import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { User } from '@/models/User';

const updateTeamRoleSchema = z.object({
  teamRole: z.enum(['leader', 'member']),
});

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();
    
    // Prevent users from changing their own role
    if (session?.user?.id === params.userId) {
      return NextResponse.json(
        { error: 'Cannot modify your own team role' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { teamRole } = updateTeamRoleSchema.parse(body);

    await connectDB();

    // Update user using Mongoose to ensure proper validation
    const user = await User.findByIdAndUpdate(
      params.userId,
      { 
        $set: { 
          teamRole,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User team role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        teamRole: user.teamRole
      }
    });

  } catch (error) {
    console.error('Error updating user team role:', error);

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
      { error: 'Failed to update user team role' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware }; 