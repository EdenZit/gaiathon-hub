'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import DocumentManagement from '@/components/features/teams/features/DocumentManagement';
import TeamChat from '@/components/features/teams/features/TeamChat';
import ProjectTimeline from '@/components/features/teams/features/ProjectTimeline';
import ProgressTracking from '@/components/features/teams/features/ProgressTracking';
import TeamManagement from '@/components/features/teams/features/TeamManagement';
import ActivityFeed from '@/components/features/teams/features/ActivityFeed';

interface Tab {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ teamId: string; isTeamLeader: boolean }>;
}

const tabs: Tab[] = [
  { name: 'Documents', icon: DocumentIcon, component: DocumentManagement },
  { name: 'Chat', icon: ChatBubbleLeftIcon, component: TeamChat },
  { name: 'Timeline', icon: CalendarIcon, component: ProjectTimeline },
  { name: 'Progress', icon: ChartBarIcon, component: ProgressTracking },
  { name: 'Team', icon: UserGroupIcon, component: TeamManagement },
  { name: 'Activity', icon: BellIcon, component: ActivityFeed }
];

export default function TeamWorkspacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/register');
      return;
    }

    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/teams/current');
        if (response.ok) {
          const data = await response.json();
          setTeamId(data.team._id);
          setIsTeamLeader(data.team.leader === session.user.email);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [session, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Team Found</h2>
        <p className="text-gray-600 mb-8">You are not currently part of any team.</p>
        <button
          onClick={() => router.push('/resources/team-workspace/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create a Team
        </button>
      </div>
    );
  }

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-2xl font-semibold text-gray-900">Team Workspace</h1>
              {isTeamLeader && (
                <button
                  onClick={() => router.push('/resources/team-workspace/invite')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Invite Members
                </button>
              )}
            </div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 -mb-px
                      ${activeTab === index
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <ActiveComponent teamId={teamId} isTeamLeader={isTeamLeader} />
          </div>
        </div>
      </div>
    </div>
  );
} 