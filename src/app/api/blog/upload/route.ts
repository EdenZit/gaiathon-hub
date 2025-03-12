import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';

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

    console.log(`Received file upload: ${file.name}, size: ${file.size}, type: ${file.type}, context: ${context}`);

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File size exceeds limit: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Ensure the blog directory exists
    const blogDir = join(process.cwd(), 'public', 'images', 'blog');
    if (!existsSync(blogDir)) {
      mkdirSync(blogDir, { recursive: true });
    }

    // Generate a unique filename using timestamp
    const timestamp = Date.now();
    const extension = file.type.split('/')[1];
    const filename = `blog-${context}-${timestamp}.${extension}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const path = join(blogDir, filename);
    try {
      await writeFile(path, buffer);
      console.log(`File saved successfully: ${filename}`);
    } catch (err) {
      console.error('Error writing file:', err);
      return NextResponse.json(
        { error: 'Failed to save file to disk', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Return the file URL
    const response = {
      url: `/images/blog/${filename}`,
      success: true,
      context,
      size: file.size,
      type: file.type,
      filename
    };
    
    console.log('Upload response:', response);
    return NextResponse.json(response);
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