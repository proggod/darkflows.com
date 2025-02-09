import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { initDatabase } from '@/lib/db/init';
import { verifySession as authVerifySession } from '@/actions/auth';
import mongoose from 'mongoose';

// Get single post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();
    
    const post = await Post.findById(id)
      .select('title content description category author readingTime')
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
  try {
    const session = await verifySession();
    console.log('Session:', session);
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await initDatabase();
    await connectDB();

    const { id } = await context.params;
    const data = await request.json();
    console.log('Received data:', data);

    // First try direct MongoDB update
    const result = await Post.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          title: data.title,
          content: data.content,
          description: data.description,
          category: new mongoose.Types.ObjectId(data.category),
          readingTime: data.readingTime,
          updatedAt: new Date()
        }
      }
    );
    
    console.log('Direct update result:', result);

    // Then fetch the updated document
    const updatedPost = await Post.findById(id)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .lean();

    if (!updatedPost) {
      throw new Error('Failed to fetch updated post');
    }

    console.log('Final post:', updatedPost);

    return NextResponse.json({
      ...updatedPost,
      description: data.description
    });
  } catch (error) {
    console.error('Error updating post:', error);
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