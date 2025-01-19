'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  BellIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import DocumentManagement from './features/DocumentManagement';
import TeamChat from './features/TeamChat';
import ProjectTimeline from './features/ProjectTimeline';
import ProgressTracking from './features/ProgressTracking';
import TeamManagement from './features/TeamManagement';
import ActivityFeed from './features/ActivityFeed';

interface Tab {
  name: string;
  icon: any;
  component: React.ComponentType<any>;
}

const tabs: Tab[] = [
  { name: 'Documents', icon: DocumentIcon, component: DocumentManagement },
  { name: 'Chat', icon: ChatBubbleLeftRightIcon, component: TeamChat },
  { name: 'Timeline', icon: CalendarIcon, component: ProjectTimeline },
  { name: 'Progress', icon: ChartBarIcon, component: ProgressTracking },
  { name: 'Team', icon: UserGroupIcon, component: TeamManagement },
  { name: 'Activity', icon: BellIcon, component: ActivityFeed }
];

export default function TeamWorkspace() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Documents');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamLeader, setIsTeamLeader] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
      return;
    }

    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/team/current');
        if (response.ok) {
          const data = await response.json();
          setTeamId(data.team._id);
          setIsTeamLeader(data.team.leader === session?.user?.email);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchTeam();
    }
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">You are not part of any team</h2>
        <p className="text-gray-600 mb-8">Join or create a team to access the workspace</p>
        <button
          onClick={() => router.push('/resources/team-workspace/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Team
        </button>
      </div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Workspace</h1>
          {isTeamLeader && (
            <button
              onClick={() => router.push('/resources/team-workspace/invite')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <UserPlusIcon className="h-5 w-5" />
              Invite Members
            </button>
          )}
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.name
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {ActiveComponent && <ActiveComponent teamId={teamId} isTeamLeader={isTeamLeader} />}
        </div>
      </div>
    </div>
  );
} 