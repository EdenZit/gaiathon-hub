'use server';

import { Suspense } from 'react';
import { Container } from '@/components/ui/layout/container';
import { TeamsList } from '@/components/admin/teams/TeamsList';
import { TeamsSkeleton } from '@/components/admin/teams/TeamsSkeleton';

export default async function TeamManagementPage() {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        </div>

        <Suspense fallback={<TeamsSkeleton />}>
          <TeamsList />
        </Suspense>
      </div>
    </Container>
  );
} 