'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface ChatHeaderProps {
  teamId: string;
}

export default function ChatHeader({ teamId }: ChatHeaderProps) {
  const [teamInfo, setTeamInfo] = useState<{
    name: string;
    onlineMembers: number;
    totalMembers: number;
  } | null>(null);

  useEffect(() => {
    const loadTeamInfo = async () => {
      try {
        const response = await fetch(`/api/teams/${teamId}`);
        const data = await response.json();
        setTeamInfo({
          name: data.name,
          onlineMembers: data.onlineMembers || 0,
          totalMembers: data.members?.length || 0,
        });
      } catch (error) {
        console.error('Failed to load team info:', error);
      }
    };

    loadTeamInfo();
  }, [teamId]);

  if (!teamInfo) return null;

  return (
    <div className="border-b border-gray-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative">
            <Image
              src="/images/team-placeholder.png"
              alt={teamInfo.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{teamInfo.name}</h2>
            <p className="text-sm text-gray-500">
              {teamInfo.onlineMembers} online • {teamInfo.totalMembers} members
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 