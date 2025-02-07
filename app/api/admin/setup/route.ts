import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // Check if any users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Setup has already been completed' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const user = await User.create({
      ...data,
      role: 'admin',
      approved: true
    });

    return NextResponse.json({
      ...user.toObject(),
      _id: user._id.toString(),
      password: undefined
    }, { status: 201 });
  } catch (err) {
    console.error('Setup failed:', err);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
} 