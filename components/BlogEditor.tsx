'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface BlogEditorProps {
  post?: {
    _id: string;
    title: string;
    content: string;
    category: string;
  };
}

export default function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories when component mounts
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
        if (!post?.category && data.length > 0) {
          setCategory(data[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to load categories');
      }
    }

    fetchCategories();
  }, [post?.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(post ? `/api/posts/${post._id}` : '/api/posts', {
        method: post ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save post');
      }

      router.push('/blog');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-800 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-800 rounded-md"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
      </button>
    </form>
  );
} 