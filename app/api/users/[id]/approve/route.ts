import { NextResponse } from 'next/server';
import { verifySession } from '@/actions/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { NextRequest } from 'next/server';

interface UserDocument {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const session = await verifySession();
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      id,
      { approved: true },
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
    console.error('Failed to approve user:', error);
    return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
  }
} 