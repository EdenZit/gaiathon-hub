import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
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
        { error: 'Cannot modify your own role' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    const db = await connectDB();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(params.userId) },
      { $set: { role, updatedAt: new Date() } }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Error updating user role:', error);

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
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware }; 