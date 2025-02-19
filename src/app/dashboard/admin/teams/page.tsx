'use server';

import { Suspense } from 'react';
import { Container } from '@/components/ui/layout/container';
import { TeamsList } from '@/components/admin/teams/TeamsList';
import { TeamsSkeleton } from '@/components/admin/teams/TeamsSkeleton';
import { TeamExportButton } from '@/components/admin/teams/TeamExportButton';

function ExportButtonWrapper() {
  'use client';
  return <TeamExportButton />;
}

export default async function TeamManagementPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <div className="flex items-center gap-4">
            <ExportButtonWrapper />
          </div>
        </div>

        <Suspense fallback={<TeamsSkeleton />}>
          <TeamsList />
        </Suspense>
      </div>
    </Container>
  );
} 