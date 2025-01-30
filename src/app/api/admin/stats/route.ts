import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { Team } from '@/lib/db/models/Team';
import { Document } from '@/lib/db/models/Document';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);
const CACHE_TTL = 300; // 5 minutes

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get stats from cache
    const cachedStats = await redis.get('admin:stats');
    if (cachedStats) {
      return NextResponse.json(JSON.parse(cachedStats));
    }

    // Connect to database
    await connectDB();

    // Fetch stats
    const [
      totalUsers,
      totalTeams,
      totalDocuments,
      activeUsers
    ] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Document.countDocuments(),
      User.countDocuments({
        lastActive: { 
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        }
      })
    ]);

    const stats = {
      users: totalUsers,
      teams: totalTeams,
      documents: totalDocuments,
      activeUsers
    };

    // Cache the results
    await redis.setex('admin:stats', CACHE_TTL, JSON.stringify(stats));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 