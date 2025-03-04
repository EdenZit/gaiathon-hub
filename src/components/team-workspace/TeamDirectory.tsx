'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface Team {
  _id: string;
  name: string;
  description: string;
  category: string;
  leaderId: string;
  leaderDetails: {
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    country: string;
  };
  members: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    teamRole: string;
    institution: string;
    country: string;
  }[];
  memberCount: number;
  sizeLimits: {
    MIN: number;
    MAX: number;
  };
  createdAt: string;
}

export default function TeamDirectory() {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams/available');
        if (!response.ok) throw new Error('Failed to fetch teams');

        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to fetch teams');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchTeams();
    }
  }, [session]);

  const filteredTeams = selectedCategory === 'all'
    ? teams
    : teams.filter(team => team.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(teams.map(team => team.category)))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No teams available</h3>
        <p className="mt-1 text-sm text-gray-500">
          There are currently no teams looking for members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === category
                ? 'bg-navy-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Teams' : category}
          </button>
        ))}
      </div>

      {/* Teams List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeams.map((team) => (
          <div
            key={team._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {team.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {team.description}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {team.category}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  {team.memberCount} / {team.sizeLimits.MAX} members
                  {team.memberCount < team.sizeLimits.MIN && (
                    <span className="ml-2 text-yellow-600">
                      (Needs {team.sizeLimits.MIN - team.memberCount} more)
                    </span>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  {team.leaderDetails.institution || 'Institution not specified'}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  {team.leaderDetails.country || 'Country not specified'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 