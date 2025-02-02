'use client';

import { useSession } from 'next-auth/react';
import {
  FolderIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();

  const quickActions = [
    {
      name: 'Access Tools',
      href: '/dashboard/tools',
      icon: WrenchScrewdriverIcon,
      description: 'Use WEkEO and Dunia platform tools',
      color: 'bg-green-500',
    }
  ];

  const stats = [
    {
      name: 'Team Members',
      value: '1',
      icon: UserGroupIcon,
      change: 'Invite Members',
      href: '/dashboard/team',
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back{' '}
          {session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'User'}!
        </h1>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <span
                    className={`inline-flex p-3 rounded-lg ${action.color} bg-opacity-10`}
                  >
                    <action.icon
                      className={`h-6 w-6 ${action.color} text-opacity-80`}
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
                <span
                  className="absolute inset-0 rounded-lg ring-2 ring-offset-2 ring-opacity-0 group-hover:ring-opacity-50"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <stat.icon
                        className="h-6 w-6 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stat.value}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <div className="font-medium text-blue-700 hover:text-blue-900">
                      {stat.change}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 