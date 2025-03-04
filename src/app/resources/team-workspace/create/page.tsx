'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/Spinner';

type TeamCategory = 
  | 'Digital Platforms and Interactive Applications'
  | 'IoT-Enabled Smart Systems'
  | 'Geospatial Intelligence and Policy Innovation';

const CATEGORY_DESCRIPTIONS = {
  'Digital Platforms and Interactive Applications': 'Web and mobile applications that process, analyse, and visualise EO data and IoT insights for informed decision-making',
  'IoT-Enabled Smart Systems': 'Integrated IoT solutions with sensors, real-time data, and interactive dashboards for monitoring, automation, and insights',
  'Geospatial Intelligence and Policy Innovation': 'EO-based solutions for mapping, spatial analysis, and policy recommendations to tackle environmental and societal challenges'
} as const;

interface TeamFormData {
  name: string;
  category: TeamCategory;
  memberEmails: string;
}

export default function CreateTeamPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory>('Digital Platforms and Interactive Applications');
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    category: 'Digital Platforms and Interactive Applications',
    memberEmails: '',
  });

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    // Check if user is a team leader
    if (session.user.teamRole !== 'leader') {
      toast.error('Only team leaders can create teams');
      router.push('/resources/team-workspace');
      return;
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Process member emails
      const memberEmailsList = formData.memberEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          memberEmails: memberEmailsList
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team');
      }

      // Update session to reflect new team role
      await updateSession();

      toast.success('Team created successfully! You are now the team leader.');
      router.push('/resources/team-workspace');
    } catch (err) {
      console.error('Error creating team:', err);
      const error = err as Error;
      setError(error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setSelectedCategory(value as TeamCategory);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-900 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new team and select your project category.
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

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 sm:text-sm"
          >
            {Object.keys(CATEGORY_DESCRIPTIONS).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {CATEGORY_DESCRIPTIONS[selectedCategory]}
          </p>
        </div>

        <div>
          <label htmlFor="memberEmails" className="block text-sm font-medium text-gray-700">
            Team Member Emails
          </label>
          <textarea
            id="memberEmails"
            name="memberEmails"
            rows={3}
            value={formData.memberEmails}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 sm:text-sm"
            placeholder="Enter email addresses, separated by commas"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the email addresses of team members, separated by commas
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
            disabled={isLoading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-navy-600 border border-transparent rounded-md hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
          >
            {isLoading ? (
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