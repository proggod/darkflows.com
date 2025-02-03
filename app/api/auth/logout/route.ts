import { NextResponse } from 'next/server';
import { signOut } from '@/auth';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
} 