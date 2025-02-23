import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { readdirSync } from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string || 'content'; // 'cover' or 'content'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Get the next file number
    const blogDir = join(process.cwd(), 'public', 'images', 'blog');
    const existingFiles = readdirSync(blogDir)
      .filter(f => f.startsWith(`blog-${context}-`))
      .sort();
    
    const lastFileNumber = existingFiles.length > 0
      ? parseInt(existingFiles[existingFiles.length - 1].split('-')[2].split('.')[0])
      : 0;
    
    const nextNumber = lastFileNumber + 1;

    // Create filename (e.g., blog-cover-1.jpg or blog-content-1.jpg)
    const extension = file.type.split('/')[1];
    const filename = `blog-${context}-${nextNumber}.${extension}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const path = join(blogDir, filename);
    await writeFile(path, buffer);

    // Return the file URL
    return NextResponse.json({
      url: `/images/blog/${filename}`,
      success: true,
      context,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 