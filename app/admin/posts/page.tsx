import Link from 'next/link';
import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const session = await verifySession();
  
  if (session.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const posts = await Post.find()
    .populate('author', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post._id.toString()} 
            className="p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <div className="text-sm text-gray-400">
                  <span>By {post.author?.name || 'Unknown'}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category?.name || 'Uncategorized'}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                href={`/blog/${post._id}?edit=true`}
                className="text-blue-400 hover:text-blue-300"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 