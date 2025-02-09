'use client';

import { useTeam } from '@/contexts/TeamContext';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { useSession } from 'next-auth/react';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Team Chat',
    description: 'Real-time communication with team members',
    icon: ChatBubbleLeftRightIcon,
    path: 'chat',
  },
  {
    name: 'Documents',
    description: 'Collaborative document management',
    icon: DocumentTextIcon,
    path: 'documents',
  },
  {
    name: 'Members',
    description: 'View and manage team members',
    icon: UsersIcon,
    path: 'members',
  },
  {
    name: 'Calendar',
    description: 'Team events and timeline',
    icon: CalendarIcon,
    path: 'calendar',
  },
  {
    name: 'Progress',
    description: 'Track team progress and metrics',
    icon: ChartBarIcon,
    path: 'progress',
  },
];

export default function TeamWorkspacePage() {
  const { teams, isLoading, currentTeam, setCurrentTeam, error } = useTeam();
  const router = useRouter();
  const { data: session } = useSession();

  const handleTeamSelect = (teamId: string) => {
    setCurrentTeam(teamId);
    router.push(`/resources/team-workspace/${teamId}`);
  };

  const getMemberCount = (team: { members?: Array<any> }) => {
    if (!team.members || !Array.isArray(team.members)) return 0;
    return team.members.length;
  };

  // Check if user is a team leader from their profile
  const isTeamLeader = session?.user?.teamRole === 'leader';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Workspace</h1>
        <p className="mt-2 text-sm text-gray-600">
          {isTeamLeader 
            ? "Create or manage your team and collaborate with team members."
            : "Join a team to collaborate with other participants."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(teams) && teams.length > 0 ? (
          teams.map((team) => (
            <button
              key={team._id}
              onClick={() => handleTeamSelect(team._id)}
              className={`relative rounded-lg border ${
                currentTeam?._id === team._id
                  ? 'border-navy-600 ring-2 ring-navy-600'
                  : 'border-gray-300 hover:border-navy-400'
              } bg-white p-6 shadow-sm focus:outline-none`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50">
                    <UsersIcon className="h-6 w-6 text-navy-600" aria-hidden="true" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 text-left">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-500 text-left">
                    {getMemberCount(team)} members
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error ? 'Failed to load teams. Please try again.' : 
                  isTeamLeader ? 'Get started by creating a new team.' : 'Join a team to get started.'}
              </p>
              {isTeamLeader && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/resources/team-workspace/create')}
                    className="inline-flex items-center rounded-md bg-navy-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-navy-500 focus:outline-none"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Create Team
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {Array.isArray(teams) && teams.length > 0 && isTeamLeader && (
          <button
            onClick={() => router.push('/resources/team-workspace/create')}
            className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-navy-400 focus:outline-none"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
                <PlusIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-gray-900">Create New Team</span>
            </div>
          </button>
        )}
      </div>

      {currentTeam && (
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Team Features</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <button
                key={feature.name}
                onClick={() => router.push(`/resources/team-workspace/${currentTeam._id}/${feature.path}`)}
                className="relative rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:border-navy-400 focus:outline-none"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50">
                      <feature.icon className="h-6 w-6 text-navy-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-base font-medium text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 