import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPost from '@/components/BlogPost';
import { auth } from '@/auth';

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
}

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function getPost(id: string): Promise<PostDocument> {
  await connectDB();
  const post = await Post.findById(id)
    .populate('author', 'name email')
    .lean() as unknown as PostDocument;
  
  if (!post) {
    notFound();
  }
  
  return post;
}

async function getUser() {
  const session = await auth();
  return session?.user;
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, user] = await Promise.all([getPost(id), getUser()]);
  const isAuthor = user?.id === post.author._id.toString();

  return <BlogPost post={post} isPreview={isAuthor} />;
} 