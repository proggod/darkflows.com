import { NextResponse } from 'next/server';
import { verifySession } from '@/actions/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await verifySession();
    
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(users.map(user => ({
      ...user,
      _id: user._id.toString(),
      password: undefined,
      createdAt: user.createdAt.toISOString()
    })));
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const user = await User.create({
      ...body,
      approved: false // New users are not approved by default
    });

    return NextResponse.json({
      ...user.toObject(),
      _id: user._id.toString(),
      password: undefined
    }, { status: 201 });
  } catch (err) {
    console.error('Failed to create user:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 