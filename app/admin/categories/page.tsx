import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import CategoryManager from '../../../components/CategoryManager';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { SerializedCategory } from '@/types/category';

interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt: string;
}

export default async function CategoriesPage() {
  const session = await verifySession();
  
  // Only admins can access this page
  if (session.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const categories = (await Category.find().sort({ name: 1 }).lean() as unknown as { 
    _id: any, 
    name: string,
    slug: string,
    description?: string,
    createdAt: Date 
  }[]).map(cat => ({
    ...cat,
    _id: cat._id.toString(),
    createdAt: cat.createdAt.toISOString()
  }));

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
} 