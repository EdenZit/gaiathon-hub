'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, BuildingOfficeIcon, AcademicCapIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    department: '',
    location: '',
    gaiaClubName: '',
    gaiaClubRole: '',
    teamJoiningPreference: 'invite', // 'invite' or 'request'
    contactInfo: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    if (!session?.user) {
      router.push('/register');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', content: 'Profile updated successfully' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', content: error.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'An error occurred while updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <UserCircleIcon className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Institution Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  Institution Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                      Institution
                    </label>
                    <input
                      type="text"
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* GAIA Club Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <AcademicCapIcon className="h-5 w-5" />
                  GAIA Club Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="gaiaClubName" className="block text-sm font-medium text-gray-700">
                      GAIA Club Name
                    </label>
                    <input
                      type="text"
                      id="gaiaClubName"
                      value={formData.gaiaClubName}
                      onChange={(e) => setFormData(prev => ({ ...prev, gaiaClubName: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gaiaClubRole" className="block text-sm font-medium text-gray-700">
                      Your Role in GAIA Club
                    </label>
                    <input
                      type="text"
                      id="gaiaClubRole"
                      value={formData.gaiaClubRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, gaiaClubRole: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Team Joining Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Team Joining Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      How would you like to join teams?
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="invite"
                          name="teamJoiningPreference"
                          value="invite"
                          checked={formData.teamJoiningPreference === 'invite'}
                          onChange={(e) => setFormData(prev => ({ ...prev, teamJoiningPreference: e.target.value }))}
                          className="h-4 w-4 text-navy focus:ring-navy border-gray-300"
                        />
                        <label htmlFor="invite" className="ml-2 block text-sm text-gray-700">
                          Wait for team leader invitations
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="request"
                          name="teamJoiningPreference"
                          value="request"
                          checked={formData.teamJoiningPreference === 'request'}
                          onChange={(e) => setFormData(prev => ({ ...prev, teamJoiningPreference: e.target.value }))}
                          className="h-4 w-4 text-navy focus:ring-navy border-gray-300"
                        />
                        <label htmlFor="request" className="ml-2 block text-sm text-gray-700">
                          Request to join teams
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
                      Contact Information for Team Leaders
                    </label>
                    <textarea
                      id="contactInfo"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                      placeholder="Provide your preferred contact method (email, phone, etc.) for team leaders to reach you"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy focus:ring-navy sm:text-sm"
                  placeholder="Tell us about yourself and your interests in Earth Observation"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-navy hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Message Display */}
              {message.content && (
                <div className={`mt-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.content}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 