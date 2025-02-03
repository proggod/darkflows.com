import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
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
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Convert File to Buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  
  // Return the public URL
  return `/uploads/${filename}`;
} 