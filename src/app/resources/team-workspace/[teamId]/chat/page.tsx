'use client';

import { useParams } from 'next/navigation';
import TeamChat from '@/components/team-workspace/TeamChat';

export default function TeamChatPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <div className="min-h-[calc(100vh-theme(spacing.32))]">
      <TeamChat selectedTeam={teamId} />
    </div>
  );
} 