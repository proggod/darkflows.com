import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(_request: NextRequest) {
  try {
    await connectDB();
    
    // Find and fix all admin users
    const result = await User.updateMany(
      { role: 'admin' },
      { $set: { approved: true } },
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Admin users fixed',
      updated: result.modifiedCount 
    });
  } catch (err) {
    console.error('Fix failed:', err);
    return NextResponse.json({ error: 'Fix failed' }, { status: 500 });
  }
} 