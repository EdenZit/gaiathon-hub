import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { createClient } from 'redis';

const feedbackSchema = z.object({
  messageId: z.string(),
  feedback: z.enum(['up', 'down']),
});

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    await redisClient.connect();
  }
  return redisClient;
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = feedbackSchema.parse(body);

    // Store feedback in Redis
    const redis = await getRedisClient();
    const key = `feedback:${validatedData.messageId}`;
    
    await redis.hSet(key, {
      userId: session.user.id,
      feedback: validatedData.feedback,
      timestamp: new Date().toISOString(),
    });

    // Set expiration to 30 days
    await redis.expire(key, 30 * 24 * 60 * 60);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling feedback:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 