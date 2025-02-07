import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPost from '@/components/BlogPost';
import { verifySession } from '@/actions/auth';
import Link from 'next/link';
import BlogEditor from '@/components/BlogEditor';
import { redirect } from 'next/navigation';

interface PostDocument {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  coverImage?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

async function getPost(id: string): Promise<PostDocument> {
  await connectDB();
  
  // Check if the ID is valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const post = await Post.findById(id)
    .populate('author', 'name email')
    .lean();

  if (!post) {
    notFound();
  }

  // Serialize the post data
  return {
    ...post,
    _id: post._id.toString(),
    author: post.author ? {
      ...post.author,
      _id: post.author._id.toString(),
    } : {
      _id: 'deleted',
      name: 'Deleted User',
      email: '',
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

interface Props {
  params: {
    id: string;
  };
  searchParams: {
    edit?: string;
  };
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { id } = params;
  const isEditing = searchParams.edit === 'true';

  await connectDB();
  const post = await Post.findById(id).lean();

  if (!post) {
    notFound();
  }

  // Get session if editing
  let session = null;
  if (isEditing) {
    session = await verifySession();
    if (session.role !== 'admin') {
      redirect('/login');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {isEditing ? (
        <BlogEditor post={post} />
      ) : (
        <>
          <BlogPost post={post} />
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
} 