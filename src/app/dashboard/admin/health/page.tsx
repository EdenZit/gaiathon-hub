'use client';

import { useState, useEffect } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { 
  ChartBarIcon, 
  ServerIcon, 
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastChecked: Date;
  services: {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    lastError?: string;
  }[];
  metrics: {
    activeUsers: number;
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

function HealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/admin/health');
      if (!response.ok) throw new Error('Failed to fetch health data');
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
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

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Health</h1>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ServerIcon className="h-6 w-6 text-gray-400" />
            <span className="ml-2 text-sm font-medium text-gray-500">System Status</span>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[health.status]}`}>
              {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-gray-400" />
            <span className="ml-2 text-sm font-medium text-gray-500">Uptime</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {Math.floor(health.uptime / 86400)}d {Math.floor((health.uptime % 86400) / 3600)}h
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
            <span className="ml-2 text-sm font-medium text-gray-500">Active Users</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{health.metrics.activeUsers}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
            <span className="ml-2 text-sm font-medium text-gray-500">Error Rate</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{health.metrics.errorRate.toFixed(2)}%</div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Service Status</h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {health.services.map((service) => (
                <tr key={service.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[service.status]}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.responseTime}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.lastError || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Requests per Minute</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {health.metrics.requestsPerMinute}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Average Response Time</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {health.metrics.avgResponseTime}ms
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default withAdminGuard(HealthDashboard); 