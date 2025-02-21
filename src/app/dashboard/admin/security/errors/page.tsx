'use client';

import { useState, useEffect } from 'react';
import { withAdminGuard } from '@/components/auth/AdminGuard';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';
import { IErrorLog } from '@/lib/db/models/ErrorLog';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ErrorStats {
  total: number;
  unresolved: number;
  critical: number;
  byCode: Record<string, number>;
  byPath: Record<string, number>;
}

function ErrorMonitoringPage() {
  const [errors, setErrors] = useState<IErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchErrors();
    const interval = setInterval(fetchErrors, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedSeverity]);

  const fetchErrors = async () => {
    try {
      const response = await fetch(
        `/api/admin/security/errors?severity=${selectedSeverity}`
      );
      if (!response.ok) throw new Error('Failed to fetch errors');
      const data = await response.json();
      setErrors(data.errors);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load error logs');
      console.error('Error fetching error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (errorId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/admin/security/errors/${errorId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });

      if (!response.ok) throw new Error('Failed to resolve error');
      toast.success('Error marked as resolved');
      fetchErrors();
    } catch (error) {
      toast.error('Failed to resolve error');
      console.error('Error resolving error:', error);
    }
  };

  const filteredErrors = errors.filter(error => 
    error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    error.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    error.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Error Monitoring</h1>
        <div className="flex space-x-4">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="text"
            placeholder="Search errors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
              <span className="ml-2 text-sm font-medium text-gray-500">Total Errors</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
              <span className="ml-2 text-sm font-medium text-gray-500">Unresolved</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{stats.unresolved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircleIcon className="h-6 w-6 text-red-500" />
              <span className="ml-2 text-sm font-medium text-gray-500">Critical</span>
            </div>
            <div className="mt-2 text-3xl font-semibold">{stats.critical}</div>
          </div>
        </div>
      )}

      {/* Error List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredErrors.map((error) => (
            <li key={error._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {error.code}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{error.message}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>{new Date(error.timestamp).toLocaleString()}</span>
                    <span className="mx-2">•</span>
                    <span>{error.path}</span>
                    {error.userEmail && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{error.userEmail}</span>
                      </>
                    )}
                  </div>
                </div>
                {!error.resolved && (
                  <button
                    onClick={() => handleResolve(error._id, 'Issue resolved')}
                    className="ml-4 flex-shrink-0 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                  >
                    Resolve
                  </button>
                )}
              </div>
              {error.details && (
                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withAdminGuard(ErrorMonitoringPage); 