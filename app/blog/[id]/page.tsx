import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPost from '@/app/components/BlogPost';
import { verifySession } from '@/actions/auth';
import Link from 'next/link';
import BlogEditor from '@/app/components/BlogEditor';
import { formatDate } from '@/lib/format';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';

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
  searchParams: Promise<{
    edit?: string;
  }>;
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { edit } = await searchParams;
  const isEditing = edit === 'true';
  
  // Only verify session if we're editing
  const session = isEditing ? await verifySession() : null;
  
  try {
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .lean() as PostDocument;

    if (!post) {
      notFound();
    }

    // If trying to edit without admin rights, redirect
    if (isEditing && (!session || session.role !== 'admin')) {
      redirect('/login');
    }

    // Serialize for BlogEditor when editing
    const editorPost = {
      _id: post._id.toString(),
      title: post.title,
      content: String(post.content),
      category: post.category?._id.toString() || ''
    };

    // Serialize for BlogPost when viewing
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
      <div className="max-w-4xl mx-auto px-4">
        {isEditing ? (
          <BlogEditor post={editorPost} />
        ) : (
          <>
            <BlogPost post={blogPost} isPreview={session?.role === 'admin'} />
            {session?.role === 'admin' && (
              <div className="mt-8">
                <Link 
                  href={`/blog/${id}?edit=true`}
                  className="text-blue-500 hover:underline"
                >
                  Edit Post
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
} 