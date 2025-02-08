import { NextResponse } from 'next/server';
import { verifySession } from '@/actions/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Create unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.warn('Upload directory creation warning:', error);
      // Directory might already exist, continue
    }

    // Write file to uploads directory
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 