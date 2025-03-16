'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { Team } from '@/lib/api/teams';

interface TeamActionsProps {
  team: Team;
  onStatusChange: () => Promise<void>;
}

export function TeamActions({ team, onStatusChange }: TeamActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/teams/${team._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update team status');
      }

      toast.success('Team status updated successfully');
      // Instead of reloading the page, call onStatusChange to refresh the data
      await onStatusChange();
    } catch (error) {
      console.error('Error updating team status:', error);
      toast.error('Failed to update team status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team?') || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/teams/${team._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team');
      }

      toast.success('Team deleted successfully');
      // Instead of reloading the page, call onStatusChange to refresh the data
      await onStatusChange();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleStatusChange('approved')}
        disabled={isLoading}
        className="p-1 text-green-600 hover:text-green-900 disabled:opacity-50"
        title="Approve"
      >
        <CheckCircleIcon className="h-6 w-6" />
      </button>
      <button
        onClick={() => handleStatusChange('rejected')}
        disabled={isLoading}
        className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
        title="Reject"
      >
        <XCircleIcon className="h-6 w-6" />
      </button>
      <button
        onClick={() => handleStatusChange('pending')}
        disabled={isLoading}
        className="p-1 text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
        title="Mark as Pending"
      >
        <ClockIcon className="h-6 w-6" />
      </button>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
        title="Delete Team"
      >
        <TrashIcon className="h-6 w-6" />
      </button>
    </div>
  );
} 