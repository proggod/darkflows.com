import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import type { Document, FlattenMaps } from 'mongoose';
import mongoose from 'mongoose';
import { registerModels } from '@/lib/db/init';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Post {
  _id: string;
  title: string;
  description: string;
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
  description: string;
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

interface CategoryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
}

async function getPosts(categoryName?: string): Promise<Post[]> {
  // Register models before using them
  registerModels();
  
  await connectDB();
  
  let query = {};
  
  if (categoryName && categoryName !== 'All') {
    const category = await Category.findOne({ name: categoryName }).lean() as CategoryDocument | null;
    if (category) {
      query = { category: category._id };
    }
  }
  
  const posts = (await Post.find(query)
    .select('title description content author category coverImage readingTime createdAt')
    .populate({
      path: 'author',
      select: 'name email',
      model: 'User',
      options: { strictPopulate: false }
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean()) as unknown as MongoPost[];

  console.log('Posts with authors:', posts); // Debug log

  return posts.map(post => ({
    _id: post._id.toString(),
    title: post.title,
    description: post.description,
    content: post.content,
    readingTime: post.readingTime,
    author: post.author ? {
      name: String(post.author.name),
      email: String(post.author.email)
    } : {
      name: 'Deleted User',
      email: ''
    },
    category: post.category?.name || '',
    coverImage: post.coverImage,
    createdAt: post.createdAt.toISOString()
  }));
}

async function getCategories(): Promise<Category[]> {
  await connectDB();
  const categories = (await Category.find().lean()) as unknown as Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  }>;
  
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

  // Split posts into featured and regular
  const featuredPosts = posts.filter(post => post.category === 'Featured');
  const regularPosts = posts.filter(post => post.category !== 'Featured');

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <div className="flex gap-2">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/blog${category.slug === 'all' ? '' : `?category=${encodeURIComponent(category.name)}`}`}
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

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <Link key={post._id} href={`/blog/${post._id}`} className="group">
                <article className="h-full bg-[#1B1B1F] rounded-lg overflow-hidden p-6">
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 mb-4">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                        {post.author?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <div className="text-sm">
                          By {post.author?.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {post.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularPosts.map((post) => (
          <Link key={post._id} href={`/blog/${post._id}`} className="group">
            <article className="h-full bg-[#1B1B1F] rounded-lg overflow-hidden p-4">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  {post.description}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                    {post.author?.name[0].toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm">
                      By {post.author?.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {post.category}
                    </div>
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