export const runtime = 'nodejs';

import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  console.log('=== REGISTER ROUTE START ===');
  try {
    await connectDB();
    const body = await request.json();
    
    const { name, email, password } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user - password hashing is handled by the User model
    await User.create({
      name,
      email,
      password,
      role: 'user',
      approved: false
    });

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