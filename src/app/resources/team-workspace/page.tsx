import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TeamWorkspaceLayout from '@/components/team-workspace/TeamWorkspaceLayout';

export default async function TeamWorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/register');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <TeamWorkspaceLayout />
        </div>
      </div>
    </div>
  );
} 