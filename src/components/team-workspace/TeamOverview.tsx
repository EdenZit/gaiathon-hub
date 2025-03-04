import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTeam } from '@/contexts/TeamContext';
import { UserPlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'react-hot-toast';

export default function TeamOverview() {
  const { data: session } = useSession();
  const { currentTeam, isLoading } = useTeam();
  const [isAdding, setIsAdding] = useState(false);
  const isTeamLeader = session?.user?.teamRole === 'leader';

  const handleAddMember = async () => {
    setIsAdding(true);
    try {
      const email = window.prompt('Enter the email address of the user you want to add:');
      if (!email) {
        setIsAdding(false);
        return;
      }

      const response = await fetch(`/api/teams/${currentTeam?._id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add member');
      }

      toast.success('Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading || !currentTeam) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Team Profile</h3>
          {isTeamLeader && (
            <button
              onClick={handleAddMember}
              disabled={isAdding}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50"
            >
              {isAdding ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
              Team Name
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{currentTeam.name}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Team Size</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {currentTeam.members?.length || 0} members
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {currentTeam.description || 'No description provided'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(currentTeam.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
} 