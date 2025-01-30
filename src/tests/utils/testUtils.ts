import mongoose from 'mongoose';
import { User } from '@/lib/db/models/User';
import { Team } from '@/lib/db/models/Team';
import { Document } from '@/lib/db/models/Document';
import { NextRequest } from 'next/server';
import { Redis } from 'ioredis';
import { connectDB } from '@/lib/mongodb';
import type { Session } from 'next-auth';

let redis: Redis;

export async function setupTestDB() {
  try {
    // Ensure we're using the test database in Atlas
    process.env.MONGODB_URI = process.env.MONGODB_URI?.replace(
      /\/[^/?]+\?/,
      '/gaiathon_test?'
    );
    
    await connectDB();
    
    // Setup Redis for testing with retry options
    redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    // Clear all test data
    await cleanTestDB();
    
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

export async function cleanTestDB() {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    // Clear MongoDB collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    // Clear Redis
    if (redis) {
      await redis.flushall();
    }
    
    console.log('Test database cleaned');
  } catch (error) {
    console.error('Error cleaning test database:', error);
    throw error;
  }
}

let userCounter = 0;

export async function createTestAdmin() {
  const admin = await User.create({
    email: `admin.${userCounter}@test.com`,
    password: 'adminpass123',
    name: `Test Admin ${userCounter}`,
    firstName: 'Test',
    lastName: `Admin ${userCounter}`,
    role: 'admin',
    status: 'active',
    profile: {
      organization: 'Test Org',
      position: 'Admin',
      bio: 'Test admin bio'
    }
  });
  userCounter++;
  return admin;
}

export async function createTestUser(role: string = 'user') {
  const user = await User.create({
    email: `user.${userCounter}@test.com`,
    password: 'userpass123',
    name: `Test User ${userCounter}`,
    firstName: 'Test',
    lastName: `User ${userCounter}`,
    role,
    status: 'active',
    profile: {
      organization: 'Test Org',
      position: 'Member',
      bio: 'Test user bio'
    }
  });
  userCounter++;
  return user;
}

export async function createTestTeam(leaderId: mongoose.Types.ObjectId) {
  const team = await Team.create({
    name: `Test Team ${Date.now()}`,
    description: 'Test team description',
    leader: leaderId,
    members: [{
      user: leaderId,
      role: 'leader',
      joinedAt: new Date(),
      permissions: {
        canManageMembers: true,
        canManageDocuments: true,
        canManageProjects: true,
        canApproveProgress: true
      }
    }]
  });

  // Populate leader and members
  await team.populate('leader members.user', 'name email');

  // Transform to match expected format
  const transformedTeam = {
    ...team.toObject(),
    leaderId: team.leader._id || team.leader,
    members: team.members.map(member => ({
      ...member,
      userId: member.user._id || member.user
    }))
  };

  return transformedTeam;
}

export async function createTestDocument(ownerId: mongoose.Types.ObjectId, teamId?: mongoose.Types.ObjectId) {
  return await Document.create({
    title: `Test Document ${Date.now()}`,
    description: 'Test document description',
    type: 'text',
    visibility: teamId ? 'team' : 'private',
    content: 'Test content',
    owner: ownerId,
    team: teamId,
    collaborators: [],
    version: 1,
    lastModified: new Date()
  });
}

export function mockSession(sessionData: Partial<Session>) {
  const defaultSession: Session = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  global._mockSession = {
    ...defaultSession,
    ...sessionData
  };
}

export function createTestRequest(url: string, options: { method?: string; body?: any } = {}) {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: options.method || 'GET',
    ...(options.body && {
      body: JSON.stringify(options.body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  });
}

export async function closeTestDB() {
  try {
    // Close MongoDB connection
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    // Close Redis connection
    if (redis) {
      await redis.quit();
    }
    
    console.log('Test connections closed');
  } catch (error) {
    console.error('Error closing test connections:', error);
    throw error;
  }
} 
