import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// Get single post
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name email');

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err) {
    console.error('Failed to fetch post:', err);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// Update post
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date(),
        readingTime: Math.ceil(body.content.split(' ').length / 200)
      },
      { new: true }
    ).populate('author', 'name email');

    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error('Failed to update post:', err);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// Delete post
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user is the author
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Failed to delete post:', err);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 