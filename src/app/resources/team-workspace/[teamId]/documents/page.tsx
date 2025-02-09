'use client';

import { useParams } from 'next/navigation';
import TeamDocuments from '@/components/team-workspace/TeamDocuments';

export default function TeamDocumentsPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <div className="min-h-[calc(100vh-theme(spacing.32))]">
      <TeamDocuments selectedTeam={teamId} />
    </div>
  );
} 