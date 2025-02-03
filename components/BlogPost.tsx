'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

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
  };
  isPreview?: boolean;
}

export default function BlogPost({ post, isPreview = false }: BlogPostProps) {
  const router = useRouter();
  const formattedDate = format(new Date(post.createdAt), 'MMMM d, yyyy');

  return (
    <article className="max-w-4xl mx-auto p-6">
      {post.coverImage && (
        <div className="relative h-[400px] mb-8">
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
          <span>{post.category}</span>
          <span>•</span>
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{post.readingTime} min read</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            {post.author.name[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{post.author.name}</div>
            <div className="text-sm text-gray-400">{post.author.email}</div>
          </div>
        </div>
      </header>

      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {isPreview && (
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.push(`/blog/edit/${post._id}`)}
            className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
          >
            Edit
          </button>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this post?')) {
                const response = await fetch(`/api/posts/${post._id}`, {
                  method: 'DELETE',
                });
                if (response.ok) {
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
  );
} 