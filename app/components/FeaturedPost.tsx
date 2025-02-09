'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FeaturedPost {
  _id: string;
  title: string;
  description: string;
  author: {
    name: string;
    email: string;
  } | null;
  category: string;
  createdAt: string;
}

interface RawPost {
  _id: string;
  title: string;
  description: string;
  author: {
    name: string;
    email: string;
  } | null;
  category?: {
    name: string;
  };
  createdAt: string;
}

export default function FeaturedPost() {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedPosts() {
      try {
        const response = await fetch('/api/posts?category=Featured');
        const data = await response.json();
        if (data.posts) {
          setFeaturedPosts(data.posts.map((post: RawPost) => ({
            ...post,
            category: post.category?.name || 'Uncategorized'
          })));
        }
      } catch (error) {
        console.error('Error fetching featured posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 animate-pulse h-64 rounded-lg" />
          <div className="bg-gray-800 animate-pulse h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured</h2>
        <Link 
          href="/blog" 
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          More Posts →
        </Link>
      </div>
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
  );
} 