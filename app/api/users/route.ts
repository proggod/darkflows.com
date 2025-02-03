import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({});
    return NextResponse.json({ users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const user = await User.create(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error('Failed to create user:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 