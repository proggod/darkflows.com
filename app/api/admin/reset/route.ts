import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Category from '@/models/Category';
import { isBuildTime } from '@/lib/buildUtils';

export async function POST(request: NextRequest) {
  if (isBuildTime()) {
    return NextResponse.json({ error: 'Reset not available during build' }, { status: 503 });
  }

  try {
    await connectDB();
    
    const { password } = await request.json();
    
    if (password !== process.env.RESET_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    // Delete all documents from all collections
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Category.deleteMany({})
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
} 