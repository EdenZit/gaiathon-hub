'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  description: string;
  leader: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: Array<{
    user: string;
    role: 'leader' | 'member' | 'contributor';
    joinedAt: string;
    permissions: {
      canManageMembers: boolean;
      canManageDocuments: boolean;
      canManageProjects: boolean;
      canApproveProgress: boolean;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

// Add a type for raw team data from API
interface RawTeam {
  _id: string;
  name: string;
  description?: string;
  leaderId: string;
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: Error | null;
  fetchTeams: () => Promise<void>;
  setCurrentTeam: (teamId: string) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      
      // Ensure teams is always an array
      const teamsArray = Array.isArray(data) ? data : [];
      setTeams(teamsArray);

      // If there's a stored team ID, set it as current
      const storedTeamId = localStorage.getItem('currentTeamId');
      if (storedTeamId) {
        const storedTeam = teamsArray.find(t => t._id === storedTeamId);
        if (storedTeam) {
          setCurrentTeam(storedTeam);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch teams');
      setError(error);
      toast.error(error.message);
      // Set empty array on error to prevent map errors
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentTeam = (teamId: string) => {
    const team = teams.find(t => t._id === teamId);
    if (team) {
      setCurrentTeam(team);
    } else {
      toast.error('Team not found');
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchTeams();
    }
  }, [session]);

  const value = {
    teams,
    currentTeam,
    isLoading,
    error,
    fetchTeams,
    setCurrentTeam: handleSetCurrentTeam,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
} 