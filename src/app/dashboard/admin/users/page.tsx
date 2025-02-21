'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  teamRole: 'leader' | 'member';
  gender?: 'male' | 'female';
  emailVerified?: boolean;
  lastActive?: string;
  createdAt: string;
  institution?: string;
  yearOfStudy?: string;
  fieldOfStudy?: string;
  country?: string;
}

function UserManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [teamRoleFilter, setTeamRoleFilter] = useState<'all' | 'leader' | 'member'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user role');
      }
      
      toast.success('User role updated successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const updateTeamRole = async (userId: string, newTeamRole: 'leader' | 'member') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/team-role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamRole: newTeamRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update team role');
      }
      
      toast.success('Team role updated successfully. User must log out and back in for changes to take effect.');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating team role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update team role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const toggleEmailVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update email verification');
      }
      
      toast.success(`Email ${currentStatus ? 'unverified' : 'verified'} successfully`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating email verification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update email verification');
    }
  };

  const handleProfileUpdate = async (userId: string, updateData: Partial<{
    institution: string;
    yearOfStudy: string;
    fieldOfStudy: string;
    teamRole: 'leader' | 'member';
    gender: 'male' | 'female' | 'other';
    country: string;
  }>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user profile');
      }

      toast.success('Profile updated successfully');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user profile');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesTeamRole = teamRoleFilter === 'all' || user.teamRole === teamRoleFilter;

    return matchesSearch && matchesRole && matchesTeamRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/users/export');
                if (!response.ok) throw new Error('Export failed');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'users.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                toast.success('Users exported successfully');
              } catch (error) {
                console.error('Error exporting users:', error);
                toast.error('Failed to export users');
              }
            }}
            className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
          >
            Export Users
          </button>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-navy-500 focus:border-navy-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
            className="px-4 py-2 border rounded-lg focus:ring-navy-500 focus:border-navy-500"
          >
            <option value="all">All System Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={teamRoleFilter}
            onChange={(e) => setTeamRoleFilter(e.target.value as 'all' | 'leader' | 'member')}
            className="px-4 py-2 border rounded-lg focus:ring-navy-500 focus:border-navy-500"
          >
            <option value="all">All Team Roles</option>
            <option value="leader">Leaders</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year of Study
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field of Study
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value as 'user' | 'admin')}
                      className="text-sm text-gray-500 border rounded px-2 py-1"
                      disabled={user._id === session?.user?.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.teamRole}
                      onChange={(e) => updateTeamRole(user._id, e.target.value as 'leader' | 'member')}
                      className="text-sm text-gray-500 border rounded px-2 py-1"
                    >
                      <option value="member">Member</option>
                      <option value="leader">Leader</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={user.institution || ''}
                      onChange={(e) => handleProfileUpdate(user._id, { institution: e.target.value })}
                      placeholder="Institution"
                      className="text-sm text-gray-500 border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={user.yearOfStudy || ''}
                      onChange={(e) => handleProfileUpdate(user._id, { yearOfStudy: e.target.value })}
                      placeholder="Year of Study"
                      className="text-sm text-gray-500 border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={user.fieldOfStudy || ''}
                      onChange={(e) => handleProfileUpdate(user._id, { fieldOfStudy: e.target.value })}
                      placeholder="Field of Study"
                      className="text-sm text-gray-500 border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.gender || ''}
                      onChange={(e) => handleProfileUpdate(user._id, { gender: (e.target.value || undefined) as 'male' | 'female' | undefined })}
                      className="text-sm text-gray-500 border rounded px-2 py-1"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={user.country || ''}
                      onChange={(e) => handleProfileUpdate(user._id, { country: e.target.value })}
                      placeholder="Country"
                      className="text-sm text-gray-500 border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.emailVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                      <button
                        onClick={() => toggleEmailVerification(user._id, user.emailVerified || false)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          user.emailVerified
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.emailVerified ? 'Unverify' : 'Verify'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-4">
                      <button
                        onClick={() => router.push(`/dashboard/admin/users/${user._id}`)}
                        className="text-navy-600 hover:text-navy-900"
                      >
                        View Details
                      </button>
                      {user._id !== session?.user?.id && user.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete user"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAdminGuard(UserManagementPage); 