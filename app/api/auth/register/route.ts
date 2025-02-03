export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the User model pre-save hook
      role: 'author' // Default role for new users
    });

    // Remove password from response
    const userWithoutPassword = Object.fromEntries(
      Object.entries(user.toObject()).filter(([key]) => key !== 'password')
    );

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 