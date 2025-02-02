'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Tab } from '@headlessui/react';
import TeamSelector from './TeamSelector';
import TeamDirectory from './TeamDirectory';
import TeamMembers from './TeamMembers';
import TeamCreation from './TeamCreation';

interface TeamComponentProps {
  selectedTeam: string | null;
}

type TeamComponent = React.ComponentType<TeamComponentProps>;

interface TeamTab {
  name: string;
  component: TeamComponent;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function TeamWorkspaceLayout() {
  const { data: session } = useSession();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const tabs: TeamTab[] = [
    { name: 'Team Directory', component: TeamDirectory },
    { name: 'Members', component: TeamMembers },
    // Only show team creation for admins
    ...(session?.user?.role === 'admin' ? [{ name: 'Create Team', component: TeamCreation }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Workspace</h1>
        <TeamSelector
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
        />
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.name}
              className={classNames(
                'rounded-xl bg-white p-6',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              <tab.component selectedTeam={selectedTeam} />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 
