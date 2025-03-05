'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Tab } from '@headlessui/react';
import {
  UsersIcon,
  FolderIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import TeamSelector from './TeamSelector';
import TeamDirectory from './TeamDirectory';
import TeamMembers from './TeamMembers';
import TeamCreation from './TeamCreation';

interface TeamComponentProps {
  selectedTeam: string | null;
  onTeamSelect?: (teamId: string) => void;
}

type TeamComponent = React.ComponentType<TeamComponentProps>;

interface TeamTab {
  name: string;
  component: TeamComponent;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  description: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface TeamWorkspaceLayoutProps {
  children?: React.ReactNode;
}

export default function TeamWorkspaceLayout({ children }: TeamWorkspaceLayoutProps) {
  const { data: session } = useSession();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const tabs: TeamTab[] = [
    {
      name: 'Team Directory',
      component: TeamDirectory,
      icon: FolderIcon,
      description: 'Browse and manage teams'
    },
    {
      name: 'Members',
      component: TeamMembers,
      icon: UsersIcon,
      description: 'View and manage team members'
    },
    // Available to all authenticated users
    {
      name: 'Create Team',
      component: TeamCreation,
      icon: PlusCircleIcon,
      description: 'Create a new team and become a team leader'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Workspace</h1>
          <TeamSelector
            selectedTeam={selectedTeam}
            onTeamSelect={setSelectedTeam}
          />
        </div>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                    'ring-navy-500 ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                    'flex items-center justify-center gap-2',
                    selected
                      ? 'bg-navy-600 text-white shadow'
                      : 'text-gray-700 hover:bg-navy-50 hover:text-navy-700'
                  )
                }
              >
                <tab.icon className="h-5 w-5" aria-hidden="true" />
                <span>{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-6">
            {tabs.map((tab) => (
              <Tab.Panel
                key={tab.name}
                className={classNames(
                  'rounded-xl bg-white p-6 shadow-sm',
                  'ring-navy-500 ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2'
                )}
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <tab.icon className="h-6 w-6 text-navy-600" />
                    {tab.name}
                  </h2>
                  <p className="text-sm text-gray-500">{tab.description}</p>
                </div>
                <tab.component selectedTeam={selectedTeam} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
        {children}
      </div>
    </div>
  );
} 
