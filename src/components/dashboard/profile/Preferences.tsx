'use client';

import { useState } from 'react';

interface Preference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export function Preferences() {
  const [preferences, setPreferences] = useState<Preference[]>([
    {
      id: 'email-notifications',
      name: 'Email Notifications',
      description: 'Receive email notifications about your projects and collaborations',
      enabled: true,
    },
    {
      id: 'data-processing',
      name: 'Automatic Data Processing',
      description: 'Automatically process new data when available',
      enabled: false,
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Use dark theme across the platform',
      enabled: false,
    },
  ]);

  const togglePreference = (preferenceId: string) => {
    setPreferences(
      preferences.map((pref) =>
        pref.id === preferenceId ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Preferences
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Customize your experience on GAIAthon-Hub.
          </p>
        </div>

        <div className="mt-6">
          <div className="space-y-4">
            {preferences.map((preference) => (
              <div
                key={preference.id}
                className="flex items-center justify-between"
              >
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">
                    {preference.name}
                  </h4>
                  <p className="text-sm text-gray-500">{preference.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference(preference.id)}
                  className={`${
                    preference.enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span className="sr-only">Toggle {preference.name}</span>
                  <span
                    className={`${
                      preference.enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 