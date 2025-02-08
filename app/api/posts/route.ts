export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { verifySession } from '@/actions/auth';

interface PostDocument {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find({})
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean() as unknown as Array<{
        _id: { toString(): string };
        title: string;
        content: string;
        author: { _id: { toString(): string }; name: string; email: string };
        category?: { _id: { toString(): string }; name: string; slug: string };
        createdAt: Date;
        updatedAt: Date;
      }>;

    // Serialize the MongoDB documents
    const serializedPosts = posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      author: {
        ...post.author,
        _id: post.author._id.toString()
      },
      category: post.category ? {
        ...post.category,
        _id: post.category._id.toString()
      } : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));

    return NextResponse.json({ posts: serializedPosts });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession();

    await connectDB();
    const data = await request.json();

    // Create the post
    const post = await Post.create({
      ...data,
      author: session.id,
      readingTime: Math.ceil(data.content.split(' ').length / 200)
    });

    // Fetch the complete post with populated author
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email')
      .lean() as unknown as PostDocument;

    if (!populatedPost) {
      throw new Error('Failed to fetch created post');
    }

    // Serialize the response
    const serializedPost = {
      ...populatedPost,
      _id: populatedPost._id.toString(),
      author: populatedPost.author ? {
        ...populatedPost.author,
        _id: populatedPost.author._id.toString(),
      } : {
        _id: 'deleted',
        name: 'Deleted User',
        email: '',
      },
      createdAt: populatedPost.createdAt.toISOString(),
      updatedAt: populatedPost.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedPost, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 