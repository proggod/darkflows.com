import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPost from '@/app/components/BlogPost';
import { formatDate } from '@/lib/format';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';
import { initDatabase } from '@/lib/db/init';

interface _PostDocument {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  coverImage?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

// Update PostDocument interface
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
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  
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

    // Serialize for BlogPost
    const blogPost = {
      ...post,
      _id: post._id.toString(),
      author: post.author ? {
        name: String(post.author.name),
        email: String(post.author.email)
      } : { name: 'Unknown', email: '' },
      category: post.category ? {
        name: String(post.category.name),
        slug: String(post.category.slug)
      } : null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      content: String(post.content),
      formattedDate: formatDate(post.createdAt.toISOString())
    };

    return (
      <div className="w-full max-w-[90rem] mx-auto">
        <BlogPost post={blogPost} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
} 