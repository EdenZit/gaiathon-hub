'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer 
} from 'recharts';

interface AnalyticsData {
  activity: {
    documentsCreated: number;
    documentsEdited: number;
    projectsCreated: number;
    milestonesCompleted: number;
    activeUsers: number;
  };
  resources: {
    totalStorage: number;
    storageUsed: number;
    documentsCount: number;
    projectsCount: number;
    teamsCount: number;
  };
  performance: {
    averageResponseTime: number;
    errorRate: number;
    activeCollaborations: number;
    concurrentEdits: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timespan, setTimespan] = useState(86400); // 24 hours in seconds

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/analytics?timespan=${timespan}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const json = await response.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timespan]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const activityData = [
    { name: 'Documents Created', value: data.activity.documentsCreated },
    { name: 'Documents Edited', value: data.activity.documentsEdited },
    { name: 'Projects Created', value: data.activity.projectsCreated },
    { name: 'Milestones Completed', value: data.activity.milestonesCompleted }
  ];

  const storageUsedPercentage = (data.resources.storageUsed / data.resources.totalStorage) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Activity Metrics */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Resource Usage */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Storage Used</span>
              <span>{storageUsedPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${storageUsedPercentage}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Documents</p>
              <p className="text-2xl font-semibold">{data.resources.documentsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <p className="text-2xl font-semibold">{data.resources.projectsCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teams</p>
              <p className="text-2xl font-semibold">{data.resources.teamsCount}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Performance</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Average Response Time</p>
            <p className="text-2xl font-semibold">
              {data.performance.averageResponseTime.toFixed(2)}ms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Error Rate</p>
            <p className="text-2xl font-semibold">
              {data.performance.errorRate.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Collaborations</p>
            <p className="text-2xl font-semibold">
              {data.performance.activeCollaborations}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Concurrent Edits</p>
            <p className="text-2xl font-semibold">
              {data.performance.concurrentEdits}
            </p>
          </div>
        </div>
      </Card>

      {/* Active Users */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Active Users</h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">
              {data.activity.activeUsers}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Active in the last 24 hours
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-[300px]" />
        </Card>
      ))}
    </div>
  );
} 