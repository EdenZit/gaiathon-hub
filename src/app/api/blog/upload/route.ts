import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'editor'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string || 'content'; // 'cover' or 'content'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Received file upload: ${file.name}, size: ${file.size}, type: ${file.type}, context: ${context}`);

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, SVG' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File size exceeds limit: ${file.size} bytes`);
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    try {
      // Create a buffer from the file
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Generate a unique filename to prevent collisions
      const uniqueFilename = `${uuidv4()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
      
      // Ensure the upload directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'blog');
      
      // Create directories if they don't exist
      if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
        fs.mkdirSync(path.join(process.cwd(), 'public'), { mode: 0o755 });
      }
      
      if (!fs.existsSync(path.join(process.cwd(), 'public', 'images'))) {
        fs.mkdirSync(path.join(process.cwd(), 'public', 'images'), { mode: 0o755 });
      }
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { mode: 0o755 });
      }
      
      // Save the file
      const filePath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer, { mode: 0o644 });
      
      // Return the URL to the uploaded file
      const fileUrl = `/images/blog/${uniqueFilename}`;
      
      return NextResponse.json({ 
        success: true, 
        url: fileUrl,
        message: 'File uploaded successfully'
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing upload request:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 