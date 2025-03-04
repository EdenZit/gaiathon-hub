import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Team } from '@/models/Team';
import TeamDirectory from '@/components/team-workspace/TeamDirectory';
import { TeamManagement } from '@/components/features/teams/TeamManagement';

export const metadata: Metadata = {
  title: 'Teams | GAIAthon Hub',
  description: 'Manage your teams and collaborations',
};

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/register');
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    redirect('/register');
  }

  // Get user's active team if they are a team leader
  let activeTeam = null;
  if (user.role === 'team_leader') {
    activeTeam = await Team.findOne({
      leaderId: user._id,
      status: { $ne: 'rejected' }
    }).populate('members.userId', 'firstName lastName email institution country');
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <h1 className="text-3xl font-bold">Teams</h1>
          
          {!user.profileCompleted ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please complete your profile to access team features.
                  </p>
                  <div className="mt-2">
                    <a
                      href="/profile"
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                    >
                      Complete Profile <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : user.role === 'team_leader' ? (
            <div className="space-y-6">
              {activeTeam ? (
                <TeamManagement />
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Create a New Team</h2>
                  <p className="text-gray-600 mb-4">
                    As a Team Leader, you can create and manage your own team.
                  </p>
                  <a
                    href="/teams/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy-600 hover:bg-navy-700"
                  >
                    Create Team
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Available Teams</h2>
                <p className="text-gray-600 mb-4">
                  Browse available teams to find one that matches your interests.
                </p>
              </div>
              <TeamDirectory />
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 