'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  email: string;
  fullName: string;
  institution: string;
  gaiaClubName: string;
  gaiaClubRole: string;
  profileCompleted: boolean;
}

export default function InviteMembersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    // Check if user is a team leader
    const checkTeamStatus = async () => {
      try {
        const response = await fetch('/api/team/current');
        if (response.ok) {
          const data = await response.json();
          const isLeader = data.members?.some(
            (member: { user: string; role: string }) => 
              member.user === session.user?.email && member.role === 'leader'
          );
          setHasTeam(isLeader);
          if (!isLeader) {
            router.push('/dashboard');
          }
        } else {
          setHasTeam(false);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking team status:', error);
        setMessage({ type: 'error', content: 'Error checking team status' });
      }
    };

    checkTeamStatus();
  }, [session, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        if (data.users.length === 0) {
          setMessage({ type: 'info', content: 'No users found matching your search.' });
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', content: error.message || 'Failed to search users' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'An error occurred while searching users' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      setMessage({ type: 'error', content: 'Please select at least one user to invite' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmails: selectedUsers }),
      });

      if (response.ok) {
        setMessage({ type: 'success', content: 'Invitations sent successfully' });
        setSelectedUsers([]);
        setUsers([]);
        setSearchQuery('');
      } else {
        const error = await response.json();
        setMessage({ type: 'error', content: error.message || 'Failed to send invitations' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'An error occurred while sending invitations' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (email: string) => {
    setSelectedUsers(prev => 
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  if (hasTeam === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Invite Team Members</h2>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-navy hover:text-navy/90"
              >
                Back to Dashboard
              </button>
            </div>
            
            {/* Search Section */}
            <div className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">Search users</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                      placeholder="Search by name, email, or institution..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Results Section */}
            {users.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Search Results</h3>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{user.fullName}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          {user.institution} • {user.gaiaClubName} ({user.gaiaClubRole})
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.email)}
                          onChange={() => toggleUserSelection(user.email)}
                          className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite Button */}
            {selectedUsers.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleInvite}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  {isLoading ? 'Sending Invites...' : `Invite Selected (${selectedUsers.length})`}
                </button>
              </div>
            )}

            {/* Message Display */}
            {message.content && (
              <div className={`mt-4 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' :
                message.type === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {message.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 