import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { z } from 'zod';
import { redis } from '@/lib/redis';
import { ObjectId } from 'mongodb';

const generateRequestSchema = z.object({
  templateId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId } = generateRequestSchema.parse(body);

    const db = await connectDB();
    
    // Create a new report record
    const report = {
      _id: new ObjectId(),
      templateId,
      status: 'generating',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('reports').insertOne(report);

    // Add report generation task to Redis queue
    const redisClient = redis.getClient();
    await redisClient.lpush('report:queue', JSON.stringify({
      reportId: report._id.toString(),
      templateId,
      timestamp: Date.now(),
    }));

    return NextResponse.json({
      message: 'Report generation started',
      reportId: report._id.toString(),
    });

  } catch (error) {
    console.error('Error generating report:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Apply admin middleware to all routes
export { adminMiddleware as middleware }; 