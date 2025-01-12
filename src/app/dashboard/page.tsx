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
      href: '/dashboard/collaboration',
    },
    {
      name: 'Tools Used',
      value: '0',
      icon: WrenchScrewdriverIcon,
      change: 'Explore Tools',
      href: '/dashboard/tools',
    },
    {
      name: 'Data Processed',
      value: '0 GB',
      icon: ChartBarIcon,
      change: 'View Analytics',
      href: '/dashboard/analytics',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your projects and tools.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 hover:shadow-md transition-shadow duration-200"
          >
            <dt>
              <div className="absolute rounded-md bg-blue-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-blue-600">
                {stat.change} →
              </p>
            </dd>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-3"
            >
              <div className={`${action.color} rounded-lg p-3`}>
                <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <Link
            href="/dashboard/activity"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all →
          </Link>
        </div>
        <div className="mt-4 rounded-lg border border-gray-300 bg-white px-6 py-8">
          <div className="text-center">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No recent activity
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new project or exploring available tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 