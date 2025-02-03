export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { auth } from '@/auth';

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const post = await Post.create({
      ...body,
      author: session.user.id,
      readingTime: Math.ceil(body.content.split(' ').length / 200) // Rough estimate
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error('Failed to create post:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
} 