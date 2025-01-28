'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Team {
  _id: string;
  name: string;
  description: string;
  leaderId: string;
  leader: {
    firstName: string;
    lastName: string;
  };
  members: string[];
  createdAt: string;
}

export default function TeamDirectory() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');

        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to fetch teams');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchTeams();
    }
  }, [session]);

  const handleJoinRequest = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/join-requests`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send join request');

      toast.success('Join request sent successfully');
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {teams.map((team) => {
          const isMember = team.members.includes(session?.user?.id || '') || team.leaderId === session?.user?.id;
          const isLeader = team.leaderId === session?.user?.id;

          return (
            <li
              key={team._id}
              className="bg-white shadow overflow-hidden sm:rounded-md"
            >
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {team.name}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {team.description}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Led by {team.leader.firstName} {team.leader.lastName}
                    </p>
                  </div>
                  <div>
                    {isMember ? (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Member
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(team._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Request to Join
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-5 w-5 mr-1" />
                  {team.members.length + 1} members
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 