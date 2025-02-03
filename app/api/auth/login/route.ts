export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { signIn } from '@/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 