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
      name: 'Create New Project',
      href: '/dashboard/projects/new',
      icon: FolderIcon,
      description: 'Start a new Earth Observation project',
      color: 'bg-blue-500',
    },
    {
      name: 'Access Tools',
      href: '/dashboard/tools',
      icon: WrenchScrewdriverIcon,
      description: 'Use WEkEO and Dunia platform tools',
      color: 'bg-green-500',
    },
    {
      name: 'Team Collaboration',
      href: '/dashboard/collaboration',
      icon: UserGroupIcon,
      description: 'Work with your team in real-time',
      color: 'bg-purple-500',
    },
  ];

  const stats = [
    {
      name: 'Active Projects',
      value: '0',
      icon: FolderIcon,
      change: 'Get Started',
      href: '/dashboard/projects',
    },
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
                className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <span className={`inline-flex p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <Link
                key={stat.name}
                href={stat.href}
                className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
                      {stat.name}
                    </h3>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="ml-2 text-sm text-blue-500 hover:text-blue-600">{stat.change}</p>
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