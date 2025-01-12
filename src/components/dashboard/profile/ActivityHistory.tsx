'use client';

import { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'project' | 'tool' | 'collaboration';
  action: string;
  description: string;
  timestamp: string;
}

export function ActivityHistory() {
  const [activities] = useState<Activity[]>([]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'project':
        return '📁';
      case 'tool':
        return '🔧';
      case 'collaboration':
        return '👥';
      default:
        return '📝';
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Activity History
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Your recent actions and updates on GAIAthon-Hub.
          </p>
        </div>

        <div className="mt-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No activity yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your recent activities will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 