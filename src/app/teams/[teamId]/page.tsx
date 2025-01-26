import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/utils/featureFlags';

export const metadata: Metadata = {
  title: 'Team Workspace | GAIAthon Hub',
  description: 'Team collaboration workspace',
};

interface TeamPageProps {
  params: {
    teamId: string;
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  // Check feature flag server-side
  if (!isFeatureEnabled('enableNewTeamStructure')) {
    redirect(`/resources/team-workspace/${params.teamId}`);
  }

  const session = await getServerSession();
  if (!session) {
    redirect('/register');
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Team components will be migrated here */}
          <h1 className="text-3xl font-bold">Team Workspace</h1>
          <p className="text-gray-600">Team ID: {params.teamId}</p>
        </div>
      </div>
    </main>
  );
} 