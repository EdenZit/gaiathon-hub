import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Gallery } from '@/models/Gallery';
import { revalidatePath } from 'next/cache';

// GET /api/gallery - Get all gallery items with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const query = category && category !== 'all' ? { category } : {};
    
    const [items, total] = await Promise.all([
      Gallery.find(query)
        .sort({ featuredOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'name image')
        .lean(),
      Gallery.countDocuments(query)
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Create a new gallery item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.category || !data.images?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new gallery item
    const galleryItem = await Gallery.create({
      ...data,
      uploadedBy: session.user.id
    });

    // Get a plain object with populated uploadedBy
    const savedItem = await Gallery.findById(galleryItem._id)
      .populate('uploadedBy', 'name image')
      .lean();

    // Revalidate the gallery page
    revalidatePath('/gallery');

    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    );
  }
} 