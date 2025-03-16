'use client';

import { useEffect, useState } from 'react';
import { getTeams } from '@/lib/api/teams';
import { TeamActions } from './TeamActions';
import { TeamStatusBadge } from './TeamStatusBadge';
import type { Team } from '@/lib/api/teams';

export function TeamsList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teams');
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <h3 className="text-lg font-medium text-red-800">Error loading teams</h3>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No teams found.</p>
        <p className="text-sm text-gray-400 mt-2">
          This could be because no teams have been created yet, or there might be an issue with the team data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {teams.map((team) => (
          <li key={team._id} className="px-6 py-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.category}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <TeamStatusBadge status={team.status} />
                  <TeamActions team={team} onStatusChange={fetchTeams} />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {team.members && team.members.length > 0 ? (
                  team.members.map((member) => (
                    <div key={member._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </h4>
                          <span className={`text-sm px-2 py-1 rounded ${
                            member.teamRole === 'leader' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.teamRole}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        {member.institution && (
                          <p className="text-sm text-gray-500">{member.institution}</p>
                        )}
                        {member.country && (
                          <p className="text-sm text-gray-500">{member.country}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-gray-500">No members found for this team.</p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 