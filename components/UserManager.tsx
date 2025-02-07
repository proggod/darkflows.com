'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

interface UserManagerProps {
  initialUsers: User[];
}

export default function UserManager({ initialUsers }: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      const updatedUser = await res.json();
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: updatedUser.role } : user
      ));
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/approve`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to approve user');

      const updatedUser = await res.json();
      setUsers(users.map(user => 
        user._id === userId ? { ...user, approved: true } : user
      ));
    } catch (err) {
      setError('Failed to approve user');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800/50">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-gray-700 rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  {user.approved ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-500/10 text-green-500">
                      <Check className="w-4 h-4 mr-1" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-yellow-500/10 text-yellow-500">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {!user.approved && (
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 