'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { UserPasswordReset } from '@/components/features/admin/UserPasswordReset';
import { AdminForgotPasswordReset } from '@/components/features/admin/AdminForgotPasswordReset';

interface UserDetails {
  _id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  teamRole: 'leader' | 'member';
  gender?: 'male' | 'female';
  emailVerified?: boolean;
  institution?: string;
  department?: string;
  location?: string;
  contactInfo?: string;
  bio?: string;
  phoneNumber?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  country?: string;
  previousHackathonExperience?: string;
  githubUrl?: string;
  personalWebsite?: string;
  linkedinUrl?: string;
  techSkills?: {
    coding: boolean;
    remoteSensing: boolean;
    gis: boolean;
    iot: boolean;
    other?: string;
  };
  createdAt: string;
  lastActive?: string;
  profileCompleted: boolean;
}

function UserDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showForgotPasswordReset, setShowForgotPasswordReset] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [params.userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${params.userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      router.push('/dashboard/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    try {
      const response = await fetch(`/api/admin/users/${params.userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user role');
      }
      
      toast.success('User role updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const handleTeamRoleChange = async (newTeamRole: 'leader' | 'member') => {
    try {
      const response = await fetch(`/api/admin/users/${params.userId}/team-role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamRole: newTeamRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update team role');
      }
      
      toast.success('Team role updated successfully');
      fetchUserDetails();
    } catch (error) {
      console.error('Error updating team role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update team role');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">User not found</h3>
        <p className="mt-1 text-sm text-gray-500">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user information and permissions
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Users
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Basic Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">System Role</dt>
              <dd className="mt-1">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value as 'user' | 'admin')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm rounded-md"
                  disabled={user._id === session?.user?.id}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Team Role</dt>
              <dd className="mt-1">
                <select
                  value={user.teamRole}
                  onChange={(e) => handleTeamRoleChange(e.target.value as 'leader' | 'member')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm rounded-md"
                >
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                </select>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.gender ? (
                  <span className="capitalize">{user.gender}</span>
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email Status</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Institution</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.institution || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.department || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Field of Study</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.fieldOfStudy || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Year of Study</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.yearOfStudy || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Country</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.country || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.location || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.bio || 'Not specified'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Technical Skills</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Skills</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="space-y-2">
                  {user.techSkills ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.techSkills.coding}
                          disabled
                          className="rounded border-gray-300"
                        />
                        <span>Coding</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.techSkills.remoteSensing}
                          disabled
                          className="rounded border-gray-300"
                        />
                        <span>Remote Sensing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.techSkills.gis}
                          disabled
                          className="rounded border-gray-300"
                        />
                        <span>GIS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={user.techSkills.iot}
                          disabled
                          className="rounded border-gray-300"
                        />
                        <span>IoT</span>
                      </div>
                      {user.techSkills.other && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-500">Other Skills:</span>
                          <p className="mt-1">{user.techSkills.other}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">No skills specified</span>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Account Management</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-700">Password Management</h4>
              <p className="text-sm text-gray-500 mt-1">
                Reset the user's password if they need assistance accessing their account.
              </p>
              <div className="mt-3 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(true);
                    setShowForgotPasswordReset(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                >
                  Standard Password Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordReset(true);
                    setShowPasswordReset(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Forgotten Password Reset
                </button>
              </div>
            </div>

            {showPasswordReset && user && (
              <UserPasswordReset 
                userId={user._id} 
                userEmail={user.email} 
                onSuccess={() => setShowPasswordReset(false)}
                onCancel={() => setShowPasswordReset(false)}
              />
            )}

            {showForgotPasswordReset && user && (
              <AdminForgotPasswordReset 
                userEmail={user.email} 
                onSuccess={() => setShowForgotPasswordReset(false)}
                onCancel={() => setShowForgotPasswordReset(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Information</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Previous Hackathon Experience</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.previousHackathonExperience || 'Not specified'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">GitHub Profile</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.githubUrl ? (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:text-navy-800">
                    {user.githubUrl}
                  </a>
                ) : (
                  'Not specified'
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Personal Website</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.personalWebsite ? (
                  <a href={user.personalWebsite} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:text-navy-800">
                    {user.personalWebsite}
                  </a>
                ) : (
                  'Not specified'
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">LinkedIn Profile</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.linkedinUrl ? (
                  <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:text-navy-800">
                    {user.linkedinUrl}
                  </a>
                ) : (
                  'Not specified'
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default withAdminGuard(UserDetailsPage); 