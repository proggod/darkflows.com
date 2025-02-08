import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import { verifySession } from '@/lib/session';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

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

async function getPosts(categoryName?: string): Promise<Post[]> {
  await connectDB();
  
  let query = {};
  
  if (categoryName && categoryName !== 'All') {
    // First find the category by name
    const category = await Category.findOne({ name: categoryName }).lean();
    if (category) {
      // Then use the category's _id in the post query
      query = { category: category._id };
    }
  }
  
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

async function getCategories(): Promise<Category[]> {
  await connectDB();
  const categories = await Category.find().lean();
  
  // Add "All" as the first category
  return [
    { _id: 'all', name: 'All', slug: 'all' },
    ...categories.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug
    }))
  ];
}

interface Props {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const [posts, categories] = await Promise.all([
    getPosts(params.category),
    getCategories()
  ]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <div className="flex gap-2">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/blog${category.slug === 'all' ? '' : `?category=${category.name}`}`}
                className={`px-3 py-1 rounded-full text-sm ${
                  params.category === category.name || (!params.category && category.slug === 'all')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
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