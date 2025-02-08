import { verifySession } from '@/actions/auth';
import AdminNav from '@/app/components/AdminNav';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAdmin = false;
  
  try {
    const session = await verifySession();
    isAdmin = session?.role === 'admin';
  } catch {
    // If verification fails, user is not admin
    isAdmin = false;
  }

  return (
    <div>
      {isAdmin && <AdminNav />}
      <div className="py-6">
        {children}
      </div>
    </div>
  );
} 