import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { initDatabase } from '@/lib/db/init';

// Get single post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();
    
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// Update post
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const session = await verifySession();

    await connectDB();
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== session.id) {
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
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession();
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await initDatabase();
    await connectDB();

    const post = await Post.findById(params.id);
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }

    await Post.deleteOne({ _id: params.id });

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { message: 'Error deleting post' },
      { status: 500 }
    );
  }
} 