export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { verifySession } from '@/actions/auth';
import { initDatabase } from '@/lib/db/init';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      const categoryDoc = await mongoose.model('Category').findOne({ name: category }).lean();
      if (categoryDoc) {
        query = { category: categoryDoc._id };
      }
    }

    const posts = await Post.find(query)
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
    console.log('Session in POST:', {
      id: session?.id,
      email: session?.email,
      role: session?.role,
      type: typeof session?.id,
      fullSession: JSON.stringify(session)
    });

    if (!session || !session.id) {
      console.log('No session or session.id found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDatabase();
    
    const data = await request.json();
    console.log('Received data:', data);
    
    // Create post with author ID from session
    const authorId = new mongoose.Types.ObjectId(session.id);
    console.log('Creating post with author:', {
      sessionId: session.id,
      authorId: authorId.toString(),
      email: session.email
    });

    // Validate author ID exists before creating post
    const user = await mongoose.model('User').findById(authorId);
    if (!user) {
      console.log('User not found for ID:', authorId.toString());
      return NextResponse.json({ error: 'Invalid author ID' }, { status: 400 });
    }

    const post = await Post.create({
      ...data,
      author: authorId,
      readingTime: Math.ceil(data.content.split(' ').length / 200)
    });

    console.log('Created post:', {
      id: post._id.toString(),
      author: post.author?.toString(),
      title: post.title
    });

    // Fetch the complete post with populated author
    const populatedPost = await Post.findById(post._id)
      .populate({
        path: 'author',
        select: 'name email',
        model: 'User'
      })
      .lean();

    console.log('Populated post:', {
      id: populatedPost?._id.toString(),
      author: populatedPost?.author,
      title: populatedPost?.title
    });

    if (!populatedPost) {
      throw new Error('Failed to fetch created post');
    }

    return NextResponse.json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// Helper function to extract text from Tiptap JSON
function extractTextFromJson(json: any): string {
  if (!json.content) return '';
  
  return json.content.reduce((text: string, node: any) => {
    if (node.type === 'text') {
      return text + ' ' + node.text;
    }
    if (node.content) {
      return text + ' ' + extractTextFromJson(node);
    }
    return text;
  }, '').trim();
} 