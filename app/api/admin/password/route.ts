import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Update interface to match what verifySession actually returns
interface SessionUser {
  id: string;
  email: string;
  role: string;
  approved: boolean;
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession() as SessionUser;
    
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Session email:', session.email);
    
    const user = await User.findOne({ email: session.email });
    console.log('Found user:', user ? 'yes' : 'no');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
} 