import { verifySession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import UserManager from '../../../components/UserManager';

async function getPendingUsers() {
  await connectDB();
  const users = await User.find({ approved: false })
    .sort({ createdAt: -1 })
    .lean() as unknown as Array<{
      _id: any;
      name: string;
      email: string;
      role: string;
      approved: boolean;
      createdAt: Date;
    }>;
  
  return users.map(user => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt.toISOString()
  }));
}

export default async function ApprovalsPage() {
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