export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { verifySession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { isBuildTime } from '@/lib/buildUtils';
import Link from 'next/link';
import { Users, FileText, Tag, UserCheck } from 'lucide-react';

const adminActions = [
  {
    title: 'Manage Users',
    description: 'Approve new users and manage existing ones',
    icon: Users,
    href: '/admin/users',
    color: 'bg-blue-500'
  },
  {
    title: 'Blog Posts',
    description: 'Create and manage blog posts',
    icon: FileText,
    href: '/blog/new',
    color: 'bg-green-500'
  },
  {
    title: 'Categories',
    description: 'Manage blog categories',
    icon: Tag,
    href: '/admin/categories',
    color: 'bg-purple-500'
  },
  {
    title: 'Pending Approvals',
    description: 'Review and approve new user registrations',
    icon: UserCheck,
    href: '/admin/approvals',
    color: 'bg-orange-500'
  }
];

export default async function AdminPage() {
  if (isBuildTime()) {
    return null;
  }

  const session = await verifySession();
  
  if (session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.href} 
              href={action.href}
              className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{action.title}</h2>
              <p className="text-gray-400">{action.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold">-</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Blog Posts</h3>
          <p className="text-3xl font-bold">-</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold">-</p>
        </div>
      </div>
    </div>
  );
} 