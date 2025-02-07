import { verifySession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import UserManager from '../../../components/UserManager';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export default async function UsersPage() {
  const session = await verifySession();
  
  // Only admins can access this page
  if (session.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <UserManager initialUsers={users.map(user => ({
        ...user,
        _id: user._id.toString(),
        password: undefined,
        createdAt: user.createdAt.toISOString()
      }))} />
    </div>
  );
} 