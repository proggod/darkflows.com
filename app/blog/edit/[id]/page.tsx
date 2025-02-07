import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogEditor from '@/components/BlogEditor';
import { verifySession } from '@/lib/session';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

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
  const post = await Post.findById(id)
    .populate('author', 'name email')
    .lean() as any;
  
  if (!post) {
    notFound();
  }
  
  // Serialize the MongoDB ObjectId and dates to strings
  return {
    ...post,
    _id: post._id.toString(),
    author: {
      ...post.author,
      _id: post.author._id.toString(),
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  } as PostDocument;
}

export default async function EditPostPage({ params }: Props) {
  const [session, { id }] = await Promise.all([
    verifySession(),
    params
  ]);

  const post = await getPost(id);

  // Check if user is the author
  if (session.id !== post.author._id) {
    notFound();
  }

  return (
    <div className="py-8">
      <BlogEditor post={post} />
    </div>
  );
} 