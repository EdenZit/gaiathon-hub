'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { format } from 'date-fns';

interface Milestone {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  }[];
}

interface MilestoneTrackerProps {
  session: Session | null;
}

export default function MilestoneTracker({ session }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/milestones');
        if (!response.ok) {
          throw new Error('Failed to fetch milestones');
        }
        const data = await response.json();
        setMilestones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  const handleStatusChange = async (milestoneId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone status');
      }

      setMilestones(milestones.map(milestone =>
        milestone._id === milestoneId
          ? { ...milestone, status: newStatus }
          : milestone
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const filteredMilestones = selectedStatus === 'all'
    ? milestones
    : milestones.filter(milestone => milestone.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Milestones</h2>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredMilestones.map((milestone) => (
          <div key={milestone._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                <p className="text-gray-600">{milestone.description}</p>
              </div>
              <select
                value={milestone.status}
                onChange={(e) => handleStatusChange(milestone._id, e.target.value as 'pending' | 'in-progress' | 'completed')}
                className={`px-3 py-1 rounded-md text-sm ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Due Date</span>
                <p>{format(new Date(milestone.dueDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Assigned To</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {milestone.assignedTo.map((user) => (
                    <span
                      key={user._id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {user.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 