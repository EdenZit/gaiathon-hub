'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DocumentManagement } from '@/components/team-workspace/DocumentManagement';
import { TeamChat } from '@/components/team-workspace/TeamChat';
import { ProjectTimeline } from '@/components/team-workspace/ProjectTimeline';
import { ProgressTracking } from '@/components/team-workspace/ProgressTracking';
import { TeamManagement } from '@/components/team-workspace/TeamManagement';
import { ActivityFeed } from '@/components/team-workspace/ActivityFeed';
import { DocumentIcon, ChatBubbleLeftIcon, CalendarIcon, ChartBarIcon, UserGroupIcon, BellIcon, UserPlusIcon } from '@heroicons/react/24/outline';

type Tab = {
  name: string;
  icon: any;
  component: any;
};

const tabs: Tab[] = [
  { name: 'Documents', icon: DocumentIcon, component: DocumentManagement },
  { name: 'Chat', icon: ChatBubbleLeftIcon, component: TeamChat },
  { name: 'Timeline', icon: CalendarIcon, component: ProjectTimeline },
  { name: 'Progress', icon: ChartBarIcon, component: ProgressTracking },
  { name: 'Team', icon: UserGroupIcon, component: TeamManagement },
  { name: 'Activity', icon: BellIcon, component: ActivityFeed },
];

export default function TeamWorkspacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLeader, setIsTeamLeader] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/team/current');
        if (!response.ok) {
          throw new Error('Failed to fetch team');
        }
        const data = await response.json();
        setTeamId(data.teamId);
        // Check if user is team leader
        setIsTeamLeader(data.members?.some(
          (member: { user: string; role: string }) => 
            member.user === session.user?.email && member.role === 'leader'
        ));
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-600">You are not part of any team.</p>
        <button
          onClick={() => router.push('/resources/team-workspace/create')}
          className="px-4 py-2 bg-navy text-white rounded hover:bg-navy/90 transition-colors"
        >
          Create Team
        </button>
      </div>
    );
  }

  const ActiveComponent = tabs[activeTab].component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-4 py-4">
              <nav className="flex -mb-px flex-1">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(index)}
                    className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10 ${
                      activeTab === index
                        ? 'text-navy border-b-2 border-navy'
                        : 'text-gray-500 border-b-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <tab.icon className="h-5 w-5" />
                      {tab.name}
                    </div>
                  </button>
                ))}
              </nav>
              {isTeamLeader && (
                <button
                  onClick={() => router.push('/resources/team-workspace/invite')}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Invite Members
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <ActiveComponent teamId={teamId} />
          </div>
        </div>
      </div>
    </div>
  );
} 