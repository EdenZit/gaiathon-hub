'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { format } from 'date-fns';

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  milestones: {
    title: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
  }[];
  progress: number;
}

interface ProjectTimelineProps {
  session: Session | null;
}

export default function ProjectTimeline({ session }: ProjectTimelineProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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

  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              project.status === 'completed' ? 'bg-green-100 text-green-800' :
              project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Start Date</span>
              <p>{format(new Date(project.startDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">End Date</span>
              <p>{format(new Date(project.endDate), 'MMM d, yyyy')}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-500">Progress</span>
              <span className="text-sm font-semibold">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-navy rounded-full h-2 transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Milestones</h4>
            {project.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-sm text-gray-500">
                    Due: {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 