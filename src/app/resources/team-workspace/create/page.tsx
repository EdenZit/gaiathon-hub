'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CreateTeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileStatus, setProfileStatus] = useState<{
    completed: boolean;
    message?: string;
  }>({ completed: false });

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    const checkProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        
        if (!data.profileCompleted) {
          setProfileStatus({
            completed: false,
            message: 'Please complete your profile before creating a team. Make sure to include your GAIA Club information and team joining preferences.',
          });
        } else {
          setProfileStatus({ completed: true });
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setProfileStatus({
          completed: false,
          message: 'Error checking profile status. Please try again.',
        });
      }
    };

    checkProfile();
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/resources/team-workspace');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to create team');
      }
    } catch (error) {
      setError('An error occurred while creating the team');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileStatus.completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Profile Incomplete</h2>
            <p className="mt-2 text-sm text-gray-600">
              {profileStatus.message}
            </p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Create New Team</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                  placeholder="Describe your team's purpose and goals"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 