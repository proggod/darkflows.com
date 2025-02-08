export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { verifySession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserManager from '@/app/components/UserManager';
import type { Types } from 'mongoose';
import { isBuildTime } from '@/lib/buildUtils';
import { getMockDataServer } from '@/lib/utils';

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

async function getPendingUsers(): Promise<User[]> {
  if (isBuildTime()) {
    return getMockDataServer<User[]>([]);
  }

  await connectDB();
  const users = await User.find({ approved: false })
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

export default async function ApprovalsPage() {
  if (isBuildTime()) {
    return null;
  }

  const session = await verifySession();
  
  // Only admins can access this page
  if (session.role !== 'admin') {
    redirect('/login');
  }

  const users = await getPendingUsers();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Pending Approvals</h1>
      {users.length === 0 ? (
        <p className="text-gray-400">No pending approvals</p>
      ) : (
        <UserManager initialUsers={users} />
      )}
    </div>
  );
} 