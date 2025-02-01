import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { AdminUserQuery, ApiError, PaginatedResponse } from '@/types/admin';
import { IUser } from '@/types/models';

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query: AdminUserQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE)),
      search: searchParams.get('search') || undefined,
      role: (searchParams.get('role') as AdminUserQuery['role']) || 'all',
      status: (searchParams.get('status') as AdminUserQuery['status']) || 'all',
      team: searchParams.get('team') || undefined
    };

    // Build MongoDB query
    const mongoQuery: Record<string, unknown> = {};
    
    if (query.role && query.role !== 'all') {
      mongoQuery.role = query.role;
    }
    
    if (query.status && query.status !== 'all') {
      mongoQuery.status = query.status;
    }
    
    if (query.team) {
      mongoQuery.teams = query.team;
    }
    
    if (query.search) {
      mongoQuery.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const total = await User.countDocuments(mongoQuery);
    const pages = Math.ceil(total / query.limit!);
    const skip = (query.page! - 1) * query.limit!;

    const users = await User.find(mongoQuery)
      .select('-password')
      .skip(skip)
      .limit(query.limit!)
      .sort({ createdAt: -1 });

    const response: PaginatedResponse<IUser> = {
      data: users,
      pagination: {
        page: query.page!,
        limit: query.limit!,
        total,
        pages
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error fetching users:', apiError);
    return NextResponse.json(
      { error: apiError.message || 'Failed to fetch users' },
      { status: apiError.status || 500 }
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