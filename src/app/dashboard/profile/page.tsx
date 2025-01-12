'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/components/dashboard/profile/UserProfile';
import { APIKeys } from '@/components/dashboard/profile/APIKeys';
import { Preferences } from '@/components/dashboard/profile/Preferences';
import { ActivityHistory } from '@/components/dashboard/profile/ActivityHistory';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile Information' },
    { id: 'preferences', name: 'Preferences' },
    { id: 'api-keys', name: 'API Keys' },
    { id: 'activity', name: 'Activity History' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200 sm:pb-0">
        <h3 className="text-2xl font-bold leading-6 text-gray-900">Profile</h3>
        <div className="mt-4">
          <div className="sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'profile' && <UserProfile user={session?.user} />}
        {activeTab === 'preferences' && <Preferences />}
        {activeTab === 'api-keys' && <APIKeys />}
        {activeTab === 'activity' && <ActivityHistory />}
      </div>
    </div>
  );
} 