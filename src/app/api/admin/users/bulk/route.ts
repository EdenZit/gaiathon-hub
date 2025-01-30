import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import mongoose from 'mongoose';

type BulkWriteResult = {
  modifiedCount?: number;
  deletedCount?: number;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds, action } = await request.json();

    if (!userIds || !Array.isArray(userIds) || !action) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Convert string IDs to ObjectIds
    const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

    // Check for last admin when deactivating or deleting
    if (['deactivate', 'delete'].includes(action)) {
      const affectedAdmins = await User.countDocuments({
        _id: { $in: objectIds },
        role: 'admin'
      });

      if (affectedAdmins > 0) {
        const totalActiveAdmins = await User.countDocuments({
          role: 'admin',
          status: 'active'
        });

        if (totalActiveAdmins <= affectedAdmins) {
          return NextResponse.json(
            { error: 'Cannot remove or deactivate all admin users' },
            { status: 400 }
          );
        }
      }
    }

    let result: BulkWriteResult;
    switch (action) {
      case 'delete':
        result = await User.deleteMany({ _id: { $in: objectIds } });
        return NextResponse.json({
          success: true,
          affected: result.deletedCount || 0
        });

      case 'activate':
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: objectIds } },
          { $set: { status: action === 'activate' ? 'active' : 'inactive' } }
        );
        return NextResponse.json({
          success: true,
          affected: result.modifiedCount || 0
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing bulk user action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
} 
