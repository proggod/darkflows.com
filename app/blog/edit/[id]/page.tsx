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
  category: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

async function getPost(id: string): Promise<PostDocument> {
  await connectDB();
  const post = await Post.findById(id)
    .populate('author', 'name email')
    .lean() as unknown as {
      _id: { toString(): string };
      title: string;
      content: string;
      category: string;
      author: { _id: { toString(): string }; name: string; email: string };
      createdAt: Date;
      updatedAt: Date;
    };
  
  if (!post) {
    notFound();
  }
  
  return {
    ...post,
    _id: post._id.toString(),
    author: post.author,
    title: post.title,
    content: post.content,
    category: post.category,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  } as PostDocument;
}

export default async function EditPostPage({ params }: Props) {
  const session = await verifySession();
  const { id } = await params;

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