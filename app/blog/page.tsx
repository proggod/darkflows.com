import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { verifySession } from '@/lib/session';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';

const CATEGORIES = ['All', 'Tutorial', 'News', 'Release', 'Guide', 'Other'];

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  author: {
    name: string;
    email: string;
  } | null;
  readingTime: number;
  createdAt: string;
}

interface MongoPost extends FlattenMaps<Document> {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  readingTime: number;
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
  createdAt: Date;
}

async function getPosts(category?: string): Promise<Post[]> {
  await connectDB();
  const query = category && category !== 'All' ? { category } : {};
  
  const posts = (await Post.find(query)
    .populate('author', 'name email')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean()) as unknown as MongoPost[];

  return posts.map(post => ({
    _id: post._id.toString(),
    title: post.title,
    content: post.content,
    readingTime: post.readingTime,
    author: post.author ? {
      name: String(post.author.name),
      email: String(post.author.email)
    } : null,
    category: post.category?.name || '',
    coverImage: post.coverImage,
    createdAt: post.createdAt.toISOString()
  }));
}

async function getSession() {
  try {
    return await verifySession();
  } catch {
    return null;  // Return null if not authenticated
  }
}

interface Props {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const [posts, session] = await Promise.all([
    getPosts(params.category),
    getSession()
  ]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/blog${category === 'All' ? '' : `?category=${category}`}`}
                className={`px-3 py-1 rounded-full text-sm ${
                  params.category === category || (!params.category && category === 'All')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {session && (
          <Link
            href="/blog/new"
            className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500"
          >
            New Post
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post._id}`}
            className="group"
          >
            <article className="h-full border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
              {post.coverImage && (
                <div className="h-48 relative">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="px-2 py-1 bg-gray-800 rounded">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span>{post.readingTime} min read</span>
                </div>

                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>

                <div className="flex items-center gap-2 mt-4">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                    {post.author?.name[0].toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {post.author?.name}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No posts found {params.category && `in ${params.category} category`}
        </div>
      )}
    </main>
  );
} 