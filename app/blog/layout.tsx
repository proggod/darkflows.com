import { verifySession } from '@/actions/auth';
import AdminNav from '@/app/components/AdminNav';

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const isAdmin = session?.role === 'admin';

  return (
    <div>
      {isAdmin && <AdminNav />}
      <div className="py-6">
        {children}
      </div>
    </div>
  );
} 