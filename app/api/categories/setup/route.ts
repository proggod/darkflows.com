import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { verifySession } from '@/lib/session';

const DEFAULT_CATEGORIES = [
  {
    name: 'Technology',
    description: 'Posts about software, hardware, and tech trends',
    slug: 'technology'
  },
  {
    name: 'Science',
    description: 'Scientific discoveries and research',
    slug: 'science'
  },
  {
    name: 'General',
    description: 'General discussion and miscellaneous topics',
    slug: 'general'
  }
];

export async function POST() {
  try {
    // Verify admin access
    const session = await verifySession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check existing categories
    const existingCount = await Category.countDocuments();
    console.log('Existing categories:', existingCount);

    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Categories already exist',
        count: existingCount 
      });
    }

    // Create default categories
    const categories = await Category.insertMany(DEFAULT_CATEGORIES);
    console.log('Created categories:', categories.length);

    return NextResponse.json({ 
      message: 'Default categories created',
      categories: categories.map(cat => ({
        ...cat.toObject(),
        _id: cat._id.toString()
      }))
    });
  } catch (error) {
    console.error('Failed to setup categories:', error);
    return NextResponse.json(
      { error: 'Failed to setup categories' },
      { status: 500 }
    );
  }
} 