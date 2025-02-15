import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = process.env.NODE_ENV === 'development' 
  ? '/app/public/uploads'
  : '/uploads';

// Ensure uploads directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadImage(file: File): Promise<string> {
  await ensureUploadDir();
  
  // Generate unique filename
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
  
  // Convert File to Buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  
  // Return the public URL
  return `/uploads/${filename}`;
} 