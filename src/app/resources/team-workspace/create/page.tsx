'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useTeam } from '@/contexts/TeamContext';
import { Spinner } from '@/components/ui/Spinner';

export default function CreateTeamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { fetchTeams } = useTeam();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberEmails: '',
  });

  useEffect(() => {
    // Redirect if not authenticated or not a team leader
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (session.user.teamRole !== 'leader') {
      toast.error('Only team leaders can create teams');
      router.push('/resources/team-workspace');
      return;
    }
  }, [session, router]);

  // Show nothing while checking authentication/role
  if (!session?.user || session.user.teamRole !== 'leader') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          memberEmails: formData.memberEmails
            .split(',')
            .map(email => email.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create team');
      }

      await fetchTeams(); // Refresh teams list
      toast.success('Team created successfully! You are now the team leader.');
      router.push('/resources/team-workspace');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new team and invite members to collaborate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Team Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 sm:text-sm"
            placeholder="Enter team name"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 sm:text-sm"
            placeholder="Enter team description"
          />
        </div>

        <div>
          <label htmlFor="memberEmails" className="block text-sm font-medium text-gray-700">
            Member Emails
          </label>
          <input
            type="text"
            id="memberEmails"
            name="memberEmails"
            value={formData.memberEmails}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 sm:text-sm"
            placeholder="Enter email addresses, separated by commas"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter email addresses separated by commas
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/resources/team-workspace')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-navy-600 border border-transparent rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating...
              </>
            ) : (
              'Create Team'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 