import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import BlogPost from '@/components/BlogPost';
import { verifySession } from '@/actions/auth';
import Link from 'next/link';
import BlogEditor from '@/components/BlogEditor';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/format';

interface PostDocument {
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

async function getPost(id: string): Promise<PostDocument> {
  await connectDB();
  
  // Check if the ID is valid MongoDB ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    notFound();
  }

  const post = await Post.findById(id)
    .populate('author', 'name email')
    .populate('category', 'name slug')
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
    category: post.category ? {
      ...post.category,
      _id: post.category._id.toString()
    } : null,
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
  const { id } = await params;
  const searchParamsResolved = await searchParams;
  const isEditing = searchParamsResolved.edit === 'true';
  const session = await verifySession();
  
  try {
    await connectDB();
    const post = await Post.findById(id)
      .populate('author', 'name email')
      .populate('category', 'name slug')
      .lean();

    if (!post) {
      notFound();
    }

    // Serialize the MongoDB document
    const serializedPost = {
      ...post,
      _id: post._id.toString(),
      author: post.author ? {
        _id: post.author._id.toString(),
        name: String(post.author.name),
        email: String(post.author.email)
      } : null,
      category: post.category ? {
        _id: post.category._id.toString(),
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
          <BlogEditor post={serializedPost} />
        ) : (
          <>
            <BlogPost 
              post={serializedPost} 
              isPreview={session?.role === 'admin'} 
            />
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