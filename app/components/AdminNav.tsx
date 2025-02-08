'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
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
              href="/admin/posts/new"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/admin/posts/new'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              New Post
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
          </div>
          
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
} 