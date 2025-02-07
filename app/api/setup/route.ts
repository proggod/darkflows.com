import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Category from '@/models/Category';

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

export async function POST(request: Request) {
  console.log('=== SETUP ROUTE START ===');
  try {
    await connectDB();
    
    // Check if any users exist
    const userCount = await User.countDocuments();
    console.log('Existing user count:', userCount);
    
    if (userCount > 0) {
      console.log('Setup already completed');
      return NextResponse.json(
        { error: 'Setup has already been completed' },
        { status: 403 }
      );
    }

    const data = await request.json();
    console.log('Setup data:', { ...data, password: '[REDACTED]' });
    
    // Create admin user with explicit approved status
    const adminUser = await User.create({
      ...data,
      role: 'admin',
      approved: true
    });
    console.log('Admin user created:', adminUser._id.toString());

    // Double-check the user was created with correct status
    const verifiedUser = await User.findByIdAndUpdate(
      adminUser._id,
      { $set: { approved: true } },
      { new: true }
    ).lean();

    if (!verifiedUser || !verifiedUser.approved) {
      throw new Error('Failed to create approved admin user');
    }

    // Create default categories
    console.log('Creating default categories...');
    try {
      const categories = await Category.insertMany(DEFAULT_CATEGORIES);
      console.log('Categories created:', categories.length);
    } catch (categoryError) {
      console.error('Failed to create categories:', categoryError);
      // Continue with setup even if categories fail
    }

    // Verify categories were created
    const categoryCount = await Category.countDocuments();
    console.log('Total categories after setup:', categoryCount);

    return NextResponse.json({
      ...verifiedUser,
      _id: verifiedUser._id.toString(),
      password: undefined
    }, { status: 201 });

  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    );
  } finally {
    console.log('=== SETUP ROUTE END ===');
  }
} 