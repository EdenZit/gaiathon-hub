'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UserPlusIcon,
  UserMinusIcon,
  KeyIcon,
  ChartBarIcon,
  FlagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'leader' | 'member';
  joinedAt: Date;
  permissions: {
    canManageMembers: boolean;
    canManageDocuments: boolean;
    canManageProjects: boolean;
    canApproveProgress: boolean;
  };
  performance?: {
    tasksCompleted: number;
    tasksInProgress: number;
    avgCompletionTime: number;
  };
}

interface Milestone {
  _id: string;
  title: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  assignedTo: string[];
}

export function TeamManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    // Fetch team data
    const fetchTeamData = async () => {
      try {
        const [membersResponse, milestonesResponse] = await Promise.all([
          fetch('/api/team/members'),
          fetch('/api/team/milestones'),
        ]);

        if (membersResponse.ok && milestonesResponse.ok) {
          const [membersData, milestonesData] = await Promise.all([
            membersResponse.json(),
            milestonesResponse.json(),
          ]);

          setMembers(membersData);
          setMilestones(milestonesData);
          
          // Check if current user is team leader
          const currentMember = membersData.find(
            (m: TeamMember) => m._id === session?.user?.id
          );
          setIsLeader(currentMember?.role === 'leader');
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    if (session?.user?.id) {
      fetchTeamData();
    }
  }, [session?.user?.id]);

  const handleInviteMember = async (email: string) => {
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setShowInviteForm(false);
        // Refresh member list
        const membersResponse = await fetch('/api/team/members');
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMembers(prev => prev.filter(member => member._id !== memberId));
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdatePermissions = async (
    memberId: string,
    permissions: TeamMember['permissions']
  ) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setMembers(prev =>
          prev.map(member => (member._id === memberId ? updatedMember : member))
        );
        setShowPermissionsForm(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Team Overview */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            {isLeader && (
              <button
                onClick={() => router.push('/dashboard/invite')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Invite Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  Total Members
                </h3>
              </div>
              <p className="mt-4 text-2xl font-semibold text-gray-900">
                {members.length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  Active Projects
                </h3>
              </div>
              <p className="mt-4 text-2xl font-semibold text-gray-900">
                {/* Replace with actual project count */}
                3
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FlagIcon className="h-6 w-6 text-purple-600" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">
                  Milestones
                </h3>
              </div>
              <p className="mt-4 text-2xl font-semibold text-gray-900">
                {milestones.length}
              </p>
            </div>
          </div>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {member.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'leader'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  {isLeader && member._id !== session?.user?.id && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowPermissionsForm(true);
                        }}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <KeyIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member._id)}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
                      >
                        <UserMinusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Member Performance */}
                {member.performance && (
                  <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Tasks Completed</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {member.performance.tasksCompleted}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tasks In Progress</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {member.performance.tasksInProgress}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg. Completion Time</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {member.performance.avgCompletionTime} days
                      </p>
                    </div>
                  </div>
                )}

                {/* Member Permissions */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Permissions
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {Object.entries(member.permissions).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center text-sm text-gray-500"
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            value ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                        />
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Invite Team Member
            </h3>
            {/* Invite form implementation */}
            <button
              onClick={() => setShowInviteForm(false)}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Send Invitation
            </button>
          </div>
        </div>
      )}

      {/* Permissions Form Modal */}
      {showPermissionsForm && selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Permissions - {selectedMember.name}
            </h3>
            {/* Permissions form implementation */}
            <button
              onClick={() => {
                setShowPermissionsForm(false);
                setSelectedMember(null);
              }}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Update Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 