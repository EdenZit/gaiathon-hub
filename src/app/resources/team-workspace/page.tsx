'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

interface TeamMember {
  _id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
}

interface Team {
  _id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  leaderId: string;
  members: TeamMember[];
  createdAt: string;
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
        if (response.status === 404) {
          setTeam(null);
        } else {
          throw new Error('Failed to fetch team');
        }
      } else {
        const data = await response.json();
        setTeam(data.team);
      }
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
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Team Workspace</h2>
            <p className="mt-4 text-lg text-gray-600">
              You are not part of any team yet.
              {session?.user?.teamRole === 'leader' ? (
                ' Create a new team to get started.'
              ) : (
                ' Join a team to get started or update your profile as Team Leader to create a new team.'
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Team Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${team.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  team.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}
              >
                {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Category</h3>
              <p className="text-gray-600">{team.category}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Created On</h3>
              <p className="text-gray-600">{new Date(team.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h2>
          <div className="space-y-4">
            {team.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                    {team.leaderId === member._id && (
                      <span className="ml-2 text-sm text-blue-600">(Team Leader)</span>
                    )}
                  </h3>
                  <p className="text-gray-600">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {team.status === 'rejected' && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Your team registration has been rejected. Please contact the administrator for more information.
            </p>
          </div>
        )}

        {team.status === 'pending' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Your team registration is pending approval from the administrator. You will be notified once it's approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 