export const dynamic = 'force-dynamic';

import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import CategoryManager from '../../../components/CategoryManager';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import type { Types } from 'mongoose';
import { isBuildTime } from '@/lib/buildUtils';

interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt: string;
}

interface MongoCategory extends Omit<Category, '_id' | 'createdAt'> {
  _id: Types.ObjectId;
  createdAt: Date;
}

export default async function CategoriesPage() {
  if (isBuildTime()) {
    return null;
  }
  
  const session = await verifySession();
  
  // Only admins can access this page
  if (session.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const categories = await Category.find()
    .sort({ name: 1 })
    .lean<MongoCategory[]>()
    .then(cats => cats.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      createdAt: cat.createdAt.toISOString()
    })));

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
} 