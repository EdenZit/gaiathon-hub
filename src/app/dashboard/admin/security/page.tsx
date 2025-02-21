'use client';

import { useState, useEffect } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface SecurityStats {
  totalErrors: number;
  unresolvedErrors: number;
  criticalErrors: number;
  loginAttempts: number;
  activeUsers: number;
}

function SecurityPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/security/stats');
        if (!response.ok) throw new Error('Failed to fetch security stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load security statistics');
        console.error('Error fetching security stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Security Overview</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <span className="ml-2 text-sm font-medium text-gray-500">Critical Errors</span>
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats?.criticalErrors || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <KeyIcon className="h-6 w-6 text-yellow-500" />
            <span className="ml-2 text-sm font-medium text-gray-500">Login Attempts</span>
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats?.loginAttempts || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-blue-500" />
            <span className="ml-2 text-sm font-medium text-gray-500">Active Users</span>
          </div>
          <div className="mt-2 text-3xl font-semibold">{stats?.activeUsers || 0}</div>
        </div>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/admin/security/errors"
          className="group bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Error Monitoring</h3>
                <p className="text-sm text-gray-500">Monitor and manage system errors</p>
              </div>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Errors</p>
              <p className="mt-1 text-2xl font-semibold">{stats?.totalErrors || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unresolved</p>
              <p className="mt-1 text-2xl font-semibold">{stats?.unresolvedErrors || 0}</p>
            </div>
          </div>
        </Link>

        {/* Add more security feature cards here */}
      </div>
    </div>
  );
}

export default withAdminGuard(SecurityPage); 