import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { adminGuard } from '@/lib/auth/adminGuard';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'export_users');
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Connect to MongoDB Atlas
    await connectDB();

    // Fetch all users with specific field selection
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    if (!users || users.length === 0) {
      return new NextResponse('No users found', { status: 404 });
    }

    // Define CSV headers
    const headers = [
      'ID',
      'Email',
      'Name',
      'Role',
      'Team Role',
      'Institution',
      'Year of Study',
      'Field of Study',
      'Gender',
      'Country',
      'Email Verified',
      'Last Active',
      'Created At'
    ].join(',');

    // Convert users to CSV rows
    const rows = users.map(user => [
      user._id.toString(),
      user.email,
      user.name || '',
      user.role || '',
      user.teamRole || '',
      user.institution || '',
      user.yearOfStudy || '',
      user.fieldOfStudy || '',
      user.gender || '',
      user.country || '',
      user.emailVerified ? 'Yes' : 'No',
      user.lastActive ? new Date(user.lastActive).toISOString() : '',
      new Date(user.createdAt).toISOString()
    ].map(field => `"${field}"`).join(','));

    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');

    // Set response headers for CSV download
    const headers_obj = new Headers();
    headers_obj.set('Content-Type', 'text/csv');
    headers_obj.set('Content-Disposition', `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`);

    return new NextResponse(csv, {
      status: 200,
      headers: headers_obj,
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return new NextResponse('Failed to export users', { status: 500 });
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware } from '@/middleware/adminMiddleware'; 