'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
  createdAt: string;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (!res.ok) throw new Error('Failed to create category');

      const category = await res.json();
      setCategories([...categories, category]);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="Category name"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
            required
          />
          <input
            type="text"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            placeholder="Description (optional)"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="border border-gray-800 rounded-md divide-y divide-gray-800">
        {categories.map((category) => (
          <div key={category._id} className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-medium">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-400">{category.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-800 rounded">
                <Pencil className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 