'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import RichTextRenderer from './RichTextRenderer';
import { generateHeadingId } from '../utils/headingUtils';
import { X } from 'lucide-react';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
  key: string;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (post?.content) {
      try {
        const contentJson = typeof post.content === 'string' 
          ? JSON.parse(post.content) 
          : post.content;

        const tocItems: TableOfContentsItem[] = [];
        const headingCounts: Record<string, number> = {};
        
        const processNode = (node: any) => {
          if (node.type === 'heading' && node.attrs?.level) {
            const text = node.content?.[0]?.text || '';
            
            // Use the same ID generation logic as RichTextRenderer
            headingCounts[text] = (headingCounts[text] || 0) + 1;
            const id = generateHeadingId(text, headingCounts[text]);
            
            tocItems.push({
              id,
              text,
              level: node.attrs.level,
              key: `toc-${id}` // Prefix with 'toc-' to ensure unique React keys
            });
          }
          
          if (node.content) {
            node.content.forEach(processNode);
          }
        };

        contentJson.content?.forEach(processNode);
        setToc(tocItems);

      } catch (error) {
        console.error('Error generating table of contents:', error);
      }
    }
  }, [post?.content]);

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
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleImageClick = useCallback((src: string) => {
    setSelectedImage(src);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <div className="w-full max-w-none mx-auto px-4 py-8">
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <article className="col-span-3 min-w-0 w-full">
          {post.coverImage && (
            <div className="relative h-[400px] mb-8 rounded-xl overflow-hidden">
              <button 
                onClick={() => handleImageClick(post.coverImage!)}
                className="w-full h-full"
              >
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
              </button>
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

          <RichTextRenderer 
            content={post.content} 
            onImageClick={handleImageClick} 
          />
        </article>

        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <nav className="space-y-2">
              {toc.map((item) => (
                <button
                  key={item.key}
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

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <Image
              src={selectedImage}
              alt="Full size image"
              width={1920}
              height={1080}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}