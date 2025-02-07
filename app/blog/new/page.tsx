import { verifySession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import BlogEditor from '@/components/BlogEditor';

export default async function NewBlogPost() {
  const session = await verifySession();
  
  // Only admins can create posts
  if (session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">New Blog Post</h1>
      <BlogEditor />
    </div>
  );
} 