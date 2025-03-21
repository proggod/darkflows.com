import { NextResponse, NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import type { ApiResponse, ApiError } from '@/types/api';

interface CategoryDocument {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}

interface SerializedCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export async function GET(): Promise<Response> {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean() as unknown as CategoryDocument[];
    
    // Properly serialize the data
    const serializedCategories: SerializedCategory[] = categories.map(category => ({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt.toISOString()
    }));

    return NextResponse.json(serializedCategories as ApiResponse);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' } as ApiError, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const category = await Category.create(data);

    // Serialize the response
    const serializedCategory: SerializedCategory = {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt.toISOString()
    };

    return NextResponse.json(serializedCategory, { status: 201 });
  } catch (err) {
    console.error('Failed to create category:', err);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
} 