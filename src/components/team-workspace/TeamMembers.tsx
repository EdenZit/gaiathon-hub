'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useTeam } from '@/hooks/useTeam';
import {
  UserIcon,
  UserPlusIcon,
  XMarkIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/Spinner';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'leader' | 'member' | 'contributor';
  joinedAt: Date;
  permissions: {
    canManageMembers: boolean;
    canManageDocuments: boolean;
    canManageProjects: boolean;
    canApproveProgress: boolean;
  };
}

export default function TeamMembers() {
  const { data: session } = useSession();
  const { currentTeam } = useTeam();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const isTeamLeader = currentTeam?.members.find(
    member => member.user.toString() === session?.user?.id && member.role === 'leader'
  );

  const fetchMembers = async () => {
    if (!currentTeam?._id) return;

    try {
      const response = await fetch(`/api/teams/${currentTeam._id}/members`);
      if (!response.ok) throw new Error('Failed to fetch members');

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam?._id || !newMemberEmail.trim()) return;

    try {
      const response = await fetch(`/api/teams/${currentTeam._id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newMemberEmail }),
      });

      if (!response.ok) throw new Error('Failed to invite member');

      toast.success('Invitation sent successfully');
      setNewMemberEmail('');
      await fetchMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam?._id || !window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/teams/${currentTeam._id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove member');

      toast.success('Member removed successfully');
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleUpdatePermissions = async (memberId: string, permissions: TeamMember['permissions']) => {
    if (!currentTeam?._id) return;

    try {
      const response = await fetch(`/api/teams/${currentTeam._id}/members/${memberId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) throw new Error('Failed to update permissions');

      toast.success('Permissions updated successfully');
      await fetchMembers();
      setShowPermissionsModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  useEffect(() => {
    if (currentTeam?._id) {
      fetchMembers();
    }
  }, [currentTeam?._id]);

  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Select a team to view members</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
        {isTeamLeader && (
          <form onSubmit={handleInviteMember} className="flex gap-2">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter email to invite"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Invite
            </button>
          </form>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member._id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center">
                      {member.role === 'leader' ? (
                        <ShieldCheckIcon className="h-6 w-6 text-navy-600" />
                      ) : (
                        <UserIcon className="h-6 w-6 text-navy-600" />
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${member.role === 'leader' 
                      ? 'bg-purple-100 text-purple-800'
                      : member.role === 'member'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {member.role}
                  </span>
                  {isTeamLeader && session?.user?.id !== member._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowPermissionsModal(true);
                        }}
                        className="text-gray-400 hover:text-navy-500"
                        title="Manage permissions"
                      >
                        <KeyIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove member"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
          {members.length === 0 && (
            <li className="px-4 py-8 sm:px-6">
              <div className="text-center text-gray-500">
                No team members yet
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Manage Permissions for {selectedMember.name}
            </h3>
            <div className="space-y-4">
              {Object.entries(selectedMember.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => {
                      const newPermissions = {
                        ...selectedMember.permissions,
                        [key]: e.target.checked,
                      };
                      handleUpdatePermissions(selectedMember._id, newPermissions);
                    }}
                    className="h-4 w-4 text-navy-600 focus:ring-navy-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedMember(null);
                }}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 