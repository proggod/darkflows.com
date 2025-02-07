import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Category from '@/models/Category';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Check reset password
    if (password !== process.env.RESET_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Delete all documents from all collections
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Category.deleteMany({})
    ]);

    return NextResponse.json({ message: 'Database reset successful' });
  } catch (err) {
    console.error('Reset failed:', err);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
} 