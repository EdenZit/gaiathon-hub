'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface TeamFormData {
  name: string;
  description: string;
  memberEmails: string[];
}

export default function TeamCreation() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    memberEmails: [''],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberEmailChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newEmails = [...prev.memberEmails];
      newEmails[index] = value;
      return {
        ...prev,
        memberEmails: newEmails,
      };
    });
  };

  const addMemberEmail = () => {
    setFormData((prev) => ({
      ...prev,
      memberEmails: [...prev.memberEmails, ''],
    }));
  };

  const removeMemberEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      memberEmails: prev.memberEmails.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          memberEmails: formData.memberEmails.filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error('Failed to create team');

      toast.success('Team created successfully');
      setFormData({
        name: '',
        description: '',
        memberEmails: [''],
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.teamRole !== 'leader') {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Not authorized
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You need to be a team leader to create teams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Team Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          required
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Invite Members
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Enter email addresses of team members you want to invite
        </p>
        <div className="mt-2 space-y-2">
          {formData.memberEmails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => handleMemberEmailChange(index, e.target.value)}
                placeholder="member@example.com"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMemberEmail(index)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMemberEmail}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Another Member
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Team...' : 'Create Team'}
        </button>
      </div>
    </form>
  );
} 
