'use client';

import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface Stats {
  users: number;
  teams: number;
  documents: number;
  activeUsers: number;
}

interface Activity {
  id: string;
  type: 'user' | 'team' | 'document';
  action: string;
  details: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity')
        ]);

        if (!statsRes.ok || !activityRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, activityData] = await Promise.all([
          statsRes.json(),
          activityRes.json()
        ]);

        setStats(statsData);
        setRecentActivity(activityData.activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.users || 0}
          icon={UsersIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Teams"
          value={stats?.teams || 0}
          icon={UserGroupIcon}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Documents"
          value={stats?.documents || 0}
          icon={DocumentTextIcon}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={UsersIcon}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="rounded-full p-3 bg-blue-50">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend.isPositive ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ml-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
        </span>
      </div>
    </div>
  );
} 