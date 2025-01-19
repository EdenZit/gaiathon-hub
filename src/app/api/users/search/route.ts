import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find users that match the search query and have completed profiles
    const users = await User.find({
      $and: [
        { email: { $ne: session.user.email } }, // Exclude current user
        { profileCompleted: true }, // Only include users with completed profiles
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { fullName: { $regex: query, $options: 'i' } },
            { institution: { $regex: query, $options: 'i' } },
            { gaiaClubName: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    })
    .select('email fullName institution gaiaClubName gaiaClubRole profileCompleted')
    .limit(10); // Limit results to 10 users

    return NextResponse.json({
      users: users.map(user => ({
        email: user.email,
        fullName: user.fullName,
        institution: user.institution,
        gaiaClubName: user.gaiaClubName,
        gaiaClubRole: user.gaiaClubRole,
        profileCompleted: user.profileCompleted,
      })),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 