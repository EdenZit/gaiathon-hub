import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { readdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Get the next file number for the category
    const galleryDir = join(process.cwd(), 'public', 'images', 'gallery');
    const existingFiles = readdirSync(galleryDir)
      .filter(f => f.startsWith(category.replace('s', '-')))
      .sort();
    
    const lastFileNumber = existingFiles.length > 0
      ? parseInt(existingFiles[existingFiles.length - 1].split('-')[2].split('.')[0])
      : 0;
    
    const nextNumber = lastFileNumber + 1;

    // Create filename following the existing pattern (e.g., team-1-1.jpg)
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${category.replace('s', '')}-1-${nextNumber}.${extension}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const path = join(galleryDir, filename);
    await writeFile(path, buffer);

    // Return the file URL
    return NextResponse.json({
      url: `/images/gallery/${filename}`,
      success: true
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 