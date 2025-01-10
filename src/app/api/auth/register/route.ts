import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: Request) {
  try {
    console.log('Starting registration process...');
    const body = await req.json();
    console.log('Received registration data:', { ...body, password: '[REDACTED]' });
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    console.log('Data validation successful');

    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      console.log('User already exists:', validatedData.email);
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating new user...');
    // Create new user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
    });
    console.log('User created successfully');

    // Remove sensitive data from response
    const userObject = user.toObject();
    const { password: _password, ...userWithoutPassword } = userObject;

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 