import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogEditor from '@/components/BlogEditor';
import { auth } from '@/auth';

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

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post, user] = await Promise.all([getPost(id), getUser()]);

  // Check if user is the author
  if (user?.id !== post.author._id.toString()) {
    notFound();
  }

  return (
    <div className="py-8">
      <BlogEditor
        initialData={{
          title: post.title,
          content: post.content,
          category: post.category,
          coverImage: post.coverImage,
        }}
        postId={id}
      />
    </div>
  );
} 