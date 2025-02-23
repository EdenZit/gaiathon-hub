import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Gallery } from '@/models/Gallery';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

// GET /api/gallery/[id] - Get a single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid gallery item ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const galleryItem = await Gallery.findById(params.id)
      .populate('uploadedBy', 'name image')
      .lean();

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(galleryItem);
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery item' },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/[id] - Update a gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid gallery item ID' },
        { status: 400 }
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

    const galleryItem = await Gallery.findById(params.id);
    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Allow admin or original uploader to update
    if (session.user.role !== 'admin' && galleryItem.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this gallery item' },
        { status: 403 }
      );
    }

    // Update the gallery item
    const updatedItem = await Gallery.findByIdAndUpdate(
      params.id,
      { ...data },
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name image');

    // Revalidate the gallery page
    revalidatePath('/gallery');

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id] - Delete a gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid gallery item ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const galleryItem = await Gallery.findById(params.id);
    
    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Check if user is the uploader
    if (galleryItem.uploadedBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this gallery item' },
        { status: 403 }
      );
    }

    await Gallery.findByIdAndDelete(params.id);

    // Revalidate the gallery page
    revalidatePath('/gallery');

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
} 