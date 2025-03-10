'use client';

import { useState, useEffect, Suspense } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Dynamically import the MaintenanceToggle component with SSR disabled
const MaintenanceToggle = dynamic(
  () => import('@/components/admin/MaintenanceToggle'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
        <p className="text-sm text-gray-600">Loading maintenance controls...</p>
      </div>
    )
  }
);

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
  const [maintenanceError, setMaintenanceError] = useState(false);

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

  // Error handler for the MaintenanceToggle component
  const handleMaintenanceError = () => {
    setMaintenanceError(true);
  };

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

      {/* Maintenance Mode Toggle with error fallback */}
      <div className="mb-6">
        {maintenanceError ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
            <p className="mt-2 text-gray-600">
              Maintenance mode controls are temporarily unavailable. Please use the command line script to toggle maintenance mode.
            </p>
          </div>
        ) : (
          <ErrorBoundary fallback={
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="mt-2 text-gray-600">
                Maintenance mode controls encountered an error. Please use the command line script to toggle maintenance mode.
              </p>
            </div>
          }>
            <Suspense fallback={
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
                <p className="text-sm text-gray-600">Loading maintenance controls...</p>
              </div>
            }>
              <MaintenanceToggle />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

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

// Simple error boundary component
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error("Error in component:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

import React from 'react';

export default withAdminGuard(SecurityPage); 