'use client';

import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPostProps {
  post: {
    _id: string;
    title: string;
    content: string;
    category: string;
    coverImage?: string;
    author: {
      name: string;
      email: string;
    };
    readingTime: number;
    createdAt: string;
    formattedDate: string;
  };
  isPreview?: boolean;
}

export default function BlogPost({ post, isPreview = false }: BlogPostProps) {
  const router = useRouter();
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);

  useEffect(() => {
    // Parse content for headings and add IDs
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3');
    
    const tocItems: TableOfContentsItem[] = Array.from(headings).map((heading, index) => {
      const text = heading.textContent || '';
      const id = text.toLowerCase().replace(/\s+/g, '-');
      heading.id = id; // Set the ID on the heading
      return {
        id,
        text,
        level: parseInt(heading.tagName[1])
      };
    });

    // Update the content with the new IDs
    post.content = doc.body.innerHTML;
    setToc(tocItems);
  }, [post.content]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Prevent default anchor jump
      const yOffset = -100; // Adjust this value based on your header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Main content */}
        <article className="col-span-3">
          {post.coverImage && (
            <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <header className="mb-8">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span>{post.category?.name || 'Uncategorized'}</span>
              <span>•</span>
              <span>{post.formattedDate}</span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                {post.author?.name[0].toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{post.author?.name}</div>
                <div className="text-sm text-gray-400">{post.author?.email}</div>
              </div>
            </div>
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none [&_h1]:mt-0 [&_h1]:mb-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-4 [&_h3]:mb-2 [&_h1,&_h2,&_h3]:scroll-mt-24"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {isPreview && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push(`/blog/${post._id}?edit=true`)}
                className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this post?')) {
                    const res = await fetch(`/api/posts/${post._id}`, {
                      method: 'DELETE',
                    });
                    if (res.ok) {
                      router.push('/blog');
                      router.refresh();
                    }
                  }
                }}
                className="px-6 py-2 bg-red-600 rounded-md hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          )}
        </article>

        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <nav className="space-y-2">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block text-left w-full text-gray-400 hover:text-white transition-colors ${
                    item.level === 2 ? 'pl-4' : item.level === 3 ? 'pl-8' : ''
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
} 