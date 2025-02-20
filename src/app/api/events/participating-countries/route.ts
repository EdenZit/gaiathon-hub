import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ParticipatingCountry } from '@/models/ParticipatingCountry';
import { z } from 'zod';

// Schema for validation
const countrySchema = z.object({
  name: z.string().min(1, 'Country name is required'),
  universities: z.array(z.string().min(1, 'University name is required')),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    await connectDB();
    const countries = await ParticipatingCountry.find({ isActive: true })
      .sort({ name: 1 })
      .select('-__v -createdAt -updatedAt');
    
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching participating countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participating countries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = countrySchema.parse(body);

    await connectDB();
    const country = await ParticipatingCountry.create(validatedData);

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('Error adding participating country:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add participating country' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    const validatedData = countrySchema.parse(updateData);

    await connectDB();
    const country = await ParticipatingCountry.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    );

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error updating participating country:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update participating country' },
      { status: 500 }
    );
  }
} 