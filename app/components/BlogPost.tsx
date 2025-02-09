'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import RichTextRenderer from './RichTextRenderer';

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
    category?: { name: string; slug: string } | null;
    coverImage?: string;
    author: {
      name: string;
      email: string;
    };
    readingTime: number;
    createdAt: string;
    formattedDate: string;
  };
}

export default function BlogPost({ post }: BlogPostProps) {
  const [toc, setToc] = useState<TableOfContentsItem[]>([]);

  useEffect(() => {
    if (post?.content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3');
      
      const tocItems = Array.from(headings).map((heading) => {
        const text = heading.textContent || '';
        const id = text.toLowerCase().replace(/\s+/g, '-');
        heading.id = id;
        return { id, text, level: parseInt(heading.tagName[1]) };
      });

      setToc(tocItems);
    }
  }, [post?.content, post]);

  useEffect(() => {
    // Initialize syntax highlighting with specific options
    hljs.configure({
      ignoreUnescapedHTML: true,
      languages: ['typescript', 'javascript', 'bash', 'json', 'html', 'css']
    });
    
    // Force highlight all code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [post.content]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full max-w-none mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <article className="col-span-3 min-w-0 w-full">
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
              <span>{typeof post.category === 'object' ? post.category?.name : 'Uncategorized'}</span>
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

          <RichTextRenderer content={post.content} />
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