'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  leaderId: string;
  members: string[];
}

interface TeamSelectorProps {
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
}

export default function TeamSelector({ selectedTeam, onTeamSelect }: TeamSelectorProps) {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');

        const data = await response.json();
        setTeams(data);

        // Auto-select the first team if none is selected
        if (!selectedTeam && data.length > 0) {
          onTeamSelect(data[0]._id);
        }
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
  }, [session, selectedTeam, onTeamSelect]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48"></div>
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="text-sm text-gray-500">
        No teams available. Create or join a team to get started.
      </div>
    );
  }

  return (
    <select
      value={selectedTeam || ''}
      onChange={(e) => onTeamSelect(e.target.value)}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
    >
      <option value="" disabled>
        Select a team
      </option>
      {teams.map((team) => (
        <option key={team._id} value={team._id}>
          {team.name}
        </option>
      ))}
    </select>
  );
} 