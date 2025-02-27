'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface TeamMember {
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  teamRole: 'leader' | 'member';
  joinedAt: string;
}

interface Team {
  _id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  leaderId: string;
  isLeader: boolean;
  members: TeamMember[];
  createdAt: string;
}

function StatusBadge({ status }: { status: Team['status'] }) {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}>
      Status: {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function TeamWorkspacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    fetchTeam();
  }, [session]);

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/teams/my-team');
      if (!response.ok) {
        throw new Error('Failed to fetch team');
      }
      const data = await response.json();
      setTeam(data.team);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    if (team) {
      toast.error('You are already part of a team');
      return;
    }
    if (session?.user?.teamRole !== 'leader') {
      toast.error('Only team leaders can create teams');
      return;
    }
    router.push('/resources/team-workspace/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Team Workspace</h2>
          {!team ? (
            <>
              <p className="mt-4 text-lg text-gray-600">
                {session?.user?.teamRole === 'leader' ? (
                  'Create a new team to get started.'
                ) : (
                  'Update your profile as Team Leader to create a new team.'
                )}
              </p>
              {session?.user?.teamRole === 'leader' ? (
                <button
                  onClick={handleCreateTeam}
                  className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Team
                </button>
              ) : (
                <Link
                  href="/dashboard/profile"
                  className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  Update Profile Settings
                </Link>
              )}
            </>
          ) : (
            <div className="mt-4">
              <p className="text-lg text-gray-600">
                You are a member of team: <span className="font-semibold">{team.name}</span>
              </p>
              <div className="mt-2 flex justify-center">
                <StatusBadge status={team.status} />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {team.members.map((member) => (
                    <div key={member.user._id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                        <span className={`text-sm ${member.teamRole === 'leader' ? 'text-blue-600' : 'text-gray-500'}`}>
                          {member.teamRole}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 