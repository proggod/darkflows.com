'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          <Link 
            href="/admin"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/admin' 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/users"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/admin/users'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Users
          </Link>
          <Link 
            href="/admin/categories"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/admin/categories'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Categories
          </Link>
          <Link 
            href="/blog/new"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/blog/new'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            New Post
          </Link>
        </div>
      </div>
    </nav>
  );
} 