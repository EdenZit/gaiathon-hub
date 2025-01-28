'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamRole: 'leader' | 'member';
}

export default function TeamMembers() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchMembers = async () => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam}/members`);
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
    if (!selectedTeam || !newMemberEmail.trim()) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam}/members`, {
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
    if (!selectedTeam || !window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam}/members/${memberId}`, {
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

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers();
    }
  }, [selectedTeam]);

  if (!session?.user?.teams?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Join a team to view members</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
        <form onSubmit={handleInviteMember} className="flex gap-2">
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Enter email to invite"
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Invite
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-6 w-6 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {member.teamRole}
                  </span>
                  {session?.user?.id !== member.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="ml-4 text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
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
    </div>
  );
} 