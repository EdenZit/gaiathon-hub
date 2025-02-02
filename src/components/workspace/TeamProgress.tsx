'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';

interface TeamStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  upcomingMilestones: {
    title: string;
    dueDate: Date;
    project: string;
  }[];
  recentActivity: {
    type: 'project' | 'milestone' | 'document';
    action: string;
    user: {
      name: string;
      id: string;
    };
    timestamp: Date;
    details: string;
  }[];
  memberContributions: {
    userId: string;
    name: string;
    completedTasks: number;
    documentsEdited: number;
    lastActive: Date;
  }[];
}

interface TeamProgressProps {
  session: Session | null;
}

export default function TeamProgress({ session }: TeamProgressProps) {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamStats = async () => {
      try {
        const response = await fetch('/api/team/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch team statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamStats();
  }, []);

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

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Projects</h3>
          <p className="text-3xl font-bold text-navy">{stats.totalProjects}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completedProjects}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.inProgressProjects}</p>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Upcoming Milestones</h3>
        <div className="space-y-4">
          {stats.upcomingMilestones.map((milestone, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{milestone.title}</p>
                <p className="text-sm text-gray-500">{milestone.project}</p>
              </div>
              <p className="text-sm text-gray-600">
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 mt-2 rounded-full ${
                activity.type === 'project' ? 'bg-blue-500' :
                activity.type === 'milestone' ? 'bg-green-500' :
                'bg-purple-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">
                  {activity.user.name} {activity.action}
                </p>
                <p className="text-sm text-gray-600">{activity.details}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Contributions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Member Contributions</h3>
        <div className="space-y-4">
          {stats.memberContributions.map((member) => (
            <div key={member.userId} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{member.name}</h4>
                <p className="text-sm text-gray-500">
                  Last active: {new Date(member.lastActive).toLocaleDateString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Completed Tasks</p>
                  <p className="font-semibold">{member.completedTasks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Documents Edited</p>
                  <p className="font-semibold">{member.documentsEdited}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 