import { verifySession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import UserManager from '@/app/components/UserManager';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import type { Types } from 'mongoose';
import { isBuildTime } from '@/lib/buildUtils';

export const dynamic = 'force-dynamic';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

interface MongoUser extends Omit<User, '_id' | 'createdAt'> {
  _id: Types.ObjectId;
  createdAt: Date;
}

async function getUsers(): Promise<User[]> {
  if (isBuildTime()) {
    return [];
  }

  await connectDB();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .lean<MongoUser[]>();
  
  return users.map(user => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    approved: user.approved,
    createdAt: user.createdAt.toISOString()
  }));
}

export default async function UsersPage() {
  if (isBuildTime()) {
    return null;
  }

  const session = await verifySession();
  
  // Only admins can access this page
  if (session.role !== 'admin') {
    redirect('/login');
  }

  const users = await getUsers();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <UserManager initialUsers={users} />
    </div>
  );
} 