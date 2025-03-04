import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { adminMiddleware } from '@/middleware/adminMiddleware';
import { z } from 'zod';

const settingsSchema = z.object({
  maintenance: z.object({
    enabled: z.boolean(),
    message: z.string().min(1),
  }),
  registration: z.object({
    enabled: z.boolean(),
    allowedDomains: z.array(z.string()),
  }),
  security: z.object({
    maxLoginAttempts: z.number().min(1).max(10),
    sessionTimeout: z.number().min(5).max(1440), // 5 minutes to 24 hours
    requireMFA: z.boolean(),
  }),
  notifications: z.object({
    emailEnabled: z.boolean(),
    slackEnabled: z.boolean(),
    webhookUrl: z.string().url().optional(),
  }),
});

export async function GET(request: NextRequest) {
  // Apply admin middleware check
  const isAdmin = await adminMiddleware(request);
  if (!isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const db = await connectDB();
    const settings = await db.collection('settings').findOne({ type: 'system' });

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        maintenance: {
          enabled: false,
          message: 'System is under maintenance. Please try again later.',
        },
        registration: {
          enabled: true,
          allowedDomains: [],
        },
        security: {
          maxLoginAttempts: 5,
          sessionTimeout: 60,
          requireMFA: false,
        },
        notifications: {
          emailEnabled: true,
          slackEnabled: false,
        },
      };

      await db.collection('settings').insertOne({
        type: 'system',
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json(defaultSettings);
    }

    // Remove internal fields before sending response
    const { _id, type, createdAt, updatedAt, ...settingsData } = settings;
    return NextResponse.json(settingsData);

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Apply admin middleware check
  const isAdmin = await adminMiddleware(request);
  if (!isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate request body
    try {
      const validatedData = settingsSchema.parse(body);
      const db = await connectDB();
      
      // Update settings
      const result = await db.collection('settings').updateOne(
        { type: 'system' },
        {
          $set: {
            ...validatedData,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (!result.acknowledged) {
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Settings updated successfully' },
        { status: 200 }
      );
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation error',
            details: validationError.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 