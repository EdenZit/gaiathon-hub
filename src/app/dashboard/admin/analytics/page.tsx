'use client';

import { useState, useEffect } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Analytics {
  userStats: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    verificationRate: number;
  };
  teamStats: {
    total: number;
    active: number;
    averageSize: number;
  };
  performanceMetrics: {
    avgResponseTime: number[];
    requestsPerHour: number[];
    errorRates: number[];
    timestamps: string[];
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkBandwidth: number;
  };
}

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!analytics) return null;

  const performanceData: ChartData<'line'> = {
    labels: analytics.performanceMetrics.timestamps,
    datasets: [
      {
        label: 'Response Time (ms)',
        data: analytics.performanceMetrics.avgResponseTime,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Requests/Hour',
        data: analytics.performanceMetrics.requestsPerHour,
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Error Rate (%)',
        data: analytics.performanceMetrics.errorRates,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="px-4 py-2 border rounded-md bg-white"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold">{analytics.userStats.total}</p>
          <p className="mt-2 text-sm text-green-600">
            +{analytics.userStats.newToday} today
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="mt-2 text-3xl font-semibold">{analytics.userStats.active}</p>
          <p className="mt-2 text-sm text-gray-600">
            {((analytics.userStats.active / analytics.userStats.total) * 100).toFixed(1)}% of total
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Teams</h3>
          <p className="mt-2 text-3xl font-semibold">{analytics.teamStats.total}</p>
          <p className="mt-2 text-sm text-gray-600">
            Avg. {analytics.teamStats.averageSize} members
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Verification Rate</h3>
          <p className="mt-2 text-3xl font-semibold">
            {(analytics.userStats.verificationRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">System Performance</h2>
        <div className="h-[400px]">
          <Line
            data={performanceData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Resource Usage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
            <div className="mt-2 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${analytics.resourceUsage.cpuUsage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                />
              </div>
              <p className="mt-1 text-sm">{analytics.resourceUsage.cpuUsage}%</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Memory Usage</h3>
            <div className="mt-2 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
                <div
                  style={{ width: `${analytics.resourceUsage.memoryUsage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                />
              </div>
              <p className="mt-1 text-sm">{analytics.resourceUsage.memoryUsage}%</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Disk Usage</h3>
            <div className="mt-2 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-yellow-200">
                <div
                  style={{ width: `${analytics.resourceUsage.diskUsage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                />
              </div>
              <p className="mt-1 text-sm">{analytics.resourceUsage.diskUsage}%</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Network Bandwidth</h3>
            <div className="mt-2 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: `${analytics.resourceUsage.networkBandwidth}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                />
              </div>
              <p className="mt-1 text-sm">{analytics.resourceUsage.networkBandwidth}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdminGuard(AnalyticsPage); 