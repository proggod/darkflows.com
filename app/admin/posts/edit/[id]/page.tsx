import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogEditor from '@/app/components/BlogEditor';
import { verifySession } from '@/actions/auth';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';
import { initDatabase } from '@/lib/db/init';

interface PostDocument extends FlattenMaps<Document> {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  author: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  } | null;
  category: {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  } | null;
  coverImage?: string;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  description: string;
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const session = await verifySession();
  
  if (session.role !== 'admin') {
    redirect('/login');
  }
  
  try {
    await initDatabase();
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .lean() as PostDocument;

    if (!post) {
      notFound();
    }

    // Serialize for BlogEditor
    const editorPost = {
      _id: post._id.toString(),
      title: post.title,
      description: post.description,
      content: String(post.content),
      category: post.category?._id.toString() || ''
    };

    return (
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
        <BlogEditor post={editorPost} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
} 