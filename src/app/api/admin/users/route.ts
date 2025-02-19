import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { AdminUserQuery, ApiError, PaginatedResponse } from '@/types/admin';
import { IUser } from '@/types/models';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { adminGuard } from '@/lib/auth/adminGuard';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await adminGuard(request, 'fetch_users');
    if (!isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Connect to MongoDB Atlas
    await connectDB();
    console.log('Connected to MongoDB Atlas for user fetch');

    // Fetch all users with specific field selection
    const users = await User.find({})
      .select('-password')  // Exclude password field
      .sort({ createdAt: -1 })
      .lean();  // Convert to plain JavaScript objects

    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Convert _id to string for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
    }));

    return NextResponse.json({ users: serializedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, role, profile } = body;

    if (!email || !password || !profile?.firstName || !profile?.lastName) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      role: role || 'user',
      status: 'active',
      name: `${profile.firstName} ${profile.lastName}`,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || ''
      }
    });

    await user.save();

    return NextResponse.json({
      user: {
        ...user.toJSON(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware }; 