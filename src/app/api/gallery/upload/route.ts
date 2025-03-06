import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';

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

    // Validate file size (2MB limit)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 2MB limit' },
        { status: 400 }
      );
    }

    // Ensure the gallery directory exists
    const galleryDir = join(process.cwd(), 'public', 'images', 'gallery');
    if (!existsSync(galleryDir)) {
      mkdirSync(galleryDir, { recursive: true });
    }

    // Normalize category name (remove trailing 's' if present)
    const normalizedCategory = category.endsWith('s') 
      ? category.slice(0, -1) 
      : category;

    // Get the next file number for the category
    let nextNumber = 1;
    try {
      const existingFiles = readdirSync(galleryDir)
        .filter(f => f.startsWith(`${normalizedCategory}-`))
        .sort();
      
      if (existingFiles.length > 0) {
        // Extract the highest number from existing files
        const numbers = existingFiles.map(filename => {
          const parts = filename.split('-');
          if (parts.length >= 3) {
            const numPart = parts[2].split('.')[0];
            return parseInt(numPart, 10);
          }
          return 0;
        });
        
        const maxNumber = Math.max(...numbers.filter(n => !isNaN(n)));
        nextNumber = maxNumber + 1;
      }
    } catch (err) {
      console.error('Error reading directory:', err);
      // Continue with default nextNumber = 1
    }

    // Create filename following the pattern (e.g., team-1-1.jpg)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${normalizedCategory}-1-${nextNumber}.${extension}`;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const path = join(galleryDir, filename);
    try {
      await writeFile(path, buffer);
      console.log(`File saved successfully: ${filename}`);
    } catch (err) {
      console.error('Error writing file:', err);
      return NextResponse.json(
        { error: 'Failed to save file to disk' },
        { status: 500 }
      );
    }

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