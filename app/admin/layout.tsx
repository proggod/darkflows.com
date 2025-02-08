import { redirect } from 'next/navigation';
import AdminNav from '@/app/components/AdminNav';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifySession } from '@/lib/session';

async function checkFirstRun() {
  await connectDB();
  const userCount = await User.countDocuments();
  return userCount === 0;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFirstRun = await checkFirstRun();
  
  // If this is first run, redirect to setup
  if (isFirstRun) {
    redirect('/setup');
  }

  // Update auth check
  const _session = await verifySession();
  
  return (
    <div>
      <AdminNav />
      <div className="py-6">
        {children}
      </div>
    </div>
  );
} 