import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/utils/featureFlags';

export const metadata: Metadata = {
  title: 'Teams | GAIAthon Hub',
  description: 'Manage and collaborate with your teams',
};

export default async function TeamsPage() {
  // Check feature flag server-side
  if (!isFeatureEnabled('enableNewTeamStructure')) {
    redirect('/resources/team-workspace');
  }

  const session = await getServerSession();
  if (!session) {
    redirect('/register');
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Teams</h1>
        {/* Team listing components will be migrated here */}
      </div>
    </main>
  );
} 