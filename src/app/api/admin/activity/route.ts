import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { Redis } from 'ioredis';
import mongoose from 'mongoose';

const redis = new Redis(process.env.REDIS_URL!);
const CACHE_TTL = 60; // 1 minute
const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const cacheKey = `admin:activity:${page}`;

    // Try to get activity from cache
    const cachedActivity = await redis.get(cacheKey);
    if (cachedActivity) {
      return NextResponse.json(JSON.parse(cachedActivity));
    }

    // Connect to database
    await connectDB();

    // Aggregate recent activity across collections
    const [userActivity, teamActivity, documentActivity] = await Promise.all([
      mongoose.connection.collection('users').aggregate([
        { $sort: { updatedAt: -1 } },
        { $limit: PAGE_SIZE },
        {
          $project: {
            type: { $literal: 'user' },
            action: {
              $cond: {
                if: { $eq: ['$createdAt', '$updatedAt'] },
                then: 'User Created',
                else: 'User Updated'
              }
            },
            details: {
              $concat: ['$firstName', ' ', '$lastName', ' (', '$email', ')']
            },
            timestamp: '$updatedAt'
          }
        }
      ]).toArray(),

      mongoose.connection.collection('teams').aggregate([
        { $sort: { updatedAt: -1 } },
        { $limit: PAGE_SIZE },
        {
          $project: {
            type: { $literal: 'team' },
            action: 'Team Activity',
            details: '$name',
            timestamp: '$updatedAt'
          }
        }
      ]).toArray(),

      mongoose.connection.collection('documents').aggregate([
        { $sort: { updatedAt: -1 } },
        { $limit: PAGE_SIZE },
        {
          $project: {
            type: { $literal: 'document' },
            action: 'Document Activity',
            details: '$name',
            timestamp: '$updatedAt'
          }
        }
      ]).toArray()
    ]);

    // Combine and sort all activity
    const allActivity = [...userActivity, ...teamActivity, ...documentActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, PAGE_SIZE)
      .map(activity => ({
        ...activity,
        id: activity._id.toString()
      }));

    const response = {
      activities: allActivity,
      page,
      hasMore: allActivity.length === PAGE_SIZE
    };

    // Cache the results
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(response));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
} 