export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { isBuildTime } from '@/lib/buildUtils';

export default async function SetupPage() {
  if (isBuildTime()) {
    return null;
  }

  await connectDB();
  const userCount = await User.countDocuments();

  if (userCount > 0) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Initial Setup</h1>
        {/* Rest of your setup form */}
      </div>
    </div>
  );
} 