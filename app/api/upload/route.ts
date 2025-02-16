import { NextResponse } from 'next/server';
import { verifySession } from '@/actions/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

// Define upload paths based on environment
const UPLOAD_DIR = process.env.NODE_ENV === 'development' 
  ? '/app/public/uploads'  // Changed from './uploads' to match Docker mount
  : '/uploads';


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'  // Adjust as needed
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    
    console.log('Upload attempt:', {
      fileSize: file?.size,
      fileType: file?.type,
      maxSize: 10 * 1024 * 1024, // 10MB in bytes
      isOverLimit: file?.size > 10 * 1024 * 1024
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const type = file.type || '';
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Create unique filename
    const ext = type.split('/')[1] || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    
    // Ensure uploads directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.warn('Upload directory creation warning:', error);
    }

    // Write file to uploads directory
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    // Return URL path that works in both environments
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 