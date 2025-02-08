import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/actions/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

interface UserDocument {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: Date;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await verifySession();
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).lean() as unknown as UserDocument;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      _id: user._id.toString()
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
} 