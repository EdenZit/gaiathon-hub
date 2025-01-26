'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  UserGroupIcon,
  UserMinusIcon,
  UserPlusIcon,
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: 'leader' | 'member';
  joinedAt: string;
  permissions: {
    manageMembers: boolean;
    manageDocuments: boolean;
    manageProjects: boolean;
    approveProgress: boolean;
  };
}

interface TeamManagementProps {
  teamId: string;
  isTeamLeader: boolean;
}

export default function TeamManagement({ teamId, isTeamLeader }: TeamManagementProps) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/team/${teamId}/members`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchMembers();
  }, [teamId]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    try {
      const response = await fetch(`/api/team/${teamId}/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMembers(members.filter(member => member._id !== memberId));
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const handleUpdatePermissions = async (memberId: string, permissions: TeamMember['permissions']) => {
    try {
      const response = await fetch(`/api/team/${teamId}/members/${memberId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setMembers(members.map(member => 
          member._id === memberId ? updatedMember : member
        ));
        setShowPermissionsModal(false);
      }
    } catch (error) {
      console.error('Error updating member permissions:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500">Manage your team members and their permissions</p>
          </div>
          {isTeamLeader && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlusIcon className="h-5 w-5" />
              Invite Members
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                {isTeamLeader && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${member.role === 'leader'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowPermissionsModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-900"
                      disabled={!isTeamLeader || member.role === 'leader'}
                    >
                      View Permissions
                    </button>
                  </td>
                  {isTeamLeader && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {member.role !== 'leader' && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Permissions for {selectedMember.name}
              </h3>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(selectedMember.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <button
                    onClick={() => {
                      if (isTeamLeader && selectedMember.role !== 'leader') {
                        handleUpdatePermissions(selectedMember._id, {
                          ...selectedMember.permissions,
                          [key]: !value
                        });
                      }
                    }}
                    disabled={!isTeamLeader || selectedMember.role === 'leader'}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${value ? 'bg-blue-600' : 'bg-gray-200'}
                      ${(!isTeamLeader || selectedMember.role === 'leader') ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${value ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 