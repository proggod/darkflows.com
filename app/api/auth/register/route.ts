export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Helper function to set session cookie
async function setSessionCookie(token: string) {
  'use server'
  const cookieStore = await cookies();
  await cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
}

export async function POST(request: NextRequest) {
  console.log('=== REGISTER ROUTE START ===');
  try {
    await connectDB();
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });

    const { name, email, password } = body;

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if this is the first user
    console.log('Checking if first user...');
    const isFirstUser = await User.countDocuments() === 0;
    console.log('Is first user:', isFirstUser);

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : 'user',
      approved: isFirstUser
    });

    // If first user, create session
    if (isFirstUser) {
      const token = await new SignJWT({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        approved: user.approved
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      // Set cookie using the helper function
      await setSessionCookie(token);

      return NextResponse.json({ 
        success: true,
        redirectTo: '/admin'
      });
    }

    return NextResponse.json({ 
      success: true,
      redirectTo: '/login'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  } finally {
    console.log('=== REGISTER ROUTE END ===');
  }
} 