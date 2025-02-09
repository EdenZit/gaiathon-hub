import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ITeam } from '@/types/models';
import { Types } from 'mongoose';

interface TeamResponse extends Omit<ITeam, '_id'> {
  _id: string;
}

interface UseTeamReturn {
  teams: ITeam[];
  currentTeam: ITeam | null;
  setCurrentTeam: (team: ITeam | null) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useTeam(): UseTeamReturn {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');

        const data = (await response.json()) as TeamResponse[];
        // Convert string _id to ObjectId
        const teamsWithObjectId: ITeam[] = data.map(team => ({
          ...team,
          _id: new Types.ObjectId(team._id),
        }));
        setTeams(teamsWithObjectId);

        // If there's a current team in localStorage, set it
        const storedTeamId = localStorage.getItem('currentTeamId');
        if (storedTeamId) {
          const team = teamsWithObjectId.find(t => t._id.toString() === storedTeamId);
          if (team) setCurrentTeam(team);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [session?.user?.id]);

  const handleSetCurrentTeam = (team: ITeam | null) => {
    setCurrentTeam(team);
    if (team) {
      localStorage.setItem('currentTeamId', team._id.toString());
    } else {
      localStorage.removeItem('currentTeamId');
    }
  };

  return {
    teams,
    currentTeam,
    setCurrentTeam: handleSetCurrentTeam,
    isLoading,
    error,
  };
} 