'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// No auth check - this is intentionally public
export const dynamic = 'force-dynamic';

interface ResetPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ResetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      console.log('Reset attempt response:', {
        status: res.status,
        ok: res.ok,
        data
      });

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset database');
      }

      router.push('/setup');
    } catch (err) {
      console.error('Reset error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Reset Database</h1>
        
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <p className="text-red-500">
            Warning: This will delete all users, posts, and categories.
            This action cannot be undone.
          </p>

          {confirmed && (
            <div>
              <label className="block text-sm font-medium mb-1">Reset Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-md mb-2"
                placeholder="Enter reset password"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="mr-2"
                />
                Show password
              </label>
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={loading || (confirmed && !password)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : confirmed ? 'Click to confirm reset' : 'Reset Database'}
          </button>
        </div>
      </div>
    </div>
  );
} 