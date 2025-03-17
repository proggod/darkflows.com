import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPost from '@/app/components/BlogPost';
import { formatDate } from '@/lib/format';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';
import { initDatabase } from '@/lib/db/init';
import { Metadata } from 'next';

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
  params: {
    id: string;
  };
}

function extractPlainText(content: string): string {
  try {
    const parsed = JSON.parse(content);
    let text = '';
    
    const traverse = (node: any) => {
      if (node.text) {
        text += node.text + ' ';
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };

    traverse(parsed);
    return text.trim().substring(0, 160) + '...';
  } catch {
    // Fallback to basic string handling if content is not JSON
    return content.substring(0, 160) + '...';
  }
}

// Update the metadata generation function signature
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = params.id;
  
  try {
    await initDatabase();
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .lean() as PostDocument;

    if (!post) {
      return {
        title: 'Post Not Found',
        description: 'The requested blog post could not be found'
      };
    }

    const plainTextDescription = extractPlainText(post.content);

    return {
      title: post.title,
      description: plainTextDescription,
      openGraph: {
        title: post.title,
        description: plainTextDescription,
        type: 'article',
        ...(post.coverImage && {
          images: [{ url: post.coverImage }],
        }),
      },
    };
  } catch {
    return {
      title: 'Error',
      description: 'There was an error loading this post'
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const id = params.id;
  
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