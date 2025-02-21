import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ErrorLog } from '@/lib/db/models/ErrorLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
  request: NextRequest,
  { params }: { params: { errorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { errorId } = params;
    const { resolution } = await request.json();

    const error = await ErrorLog.findById(errorId);
    if (!error) {
      return NextResponse.json({ error: 'Error log not found' }, { status: 404 });
    }

    error.resolved = true;
    error.resolution = resolution;
    error.resolvedAt = new Date();
    error.resolvedBy = session.user.email;
    await error.save();

    return NextResponse.json({ message: 'Error resolved successfully' });
  } catch (error) {
    console.error('Error resolving error log:', error);
    return NextResponse.json(
      { error: 'Failed to resolve error' },
      { status: 500 }
    );
  }
} 