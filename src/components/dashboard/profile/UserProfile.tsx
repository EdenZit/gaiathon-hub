'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import type { Session } from 'next-auth';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  department: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  phoneNumber: string;
  country: string;
  techSkills: {
    coding: boolean;
    remoteSensing: boolean;
    gis: boolean;
    iot: boolean;
    other?: string;
  };
  previousHackathonExperience: string;
  githubUrl?: string;
  personalWebsite?: string;
  linkedinUrl?: string;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } & Partial<UserProfileData>;
}

const UserProfile = () => {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    department: '',
    fieldOfStudy: '',
    yearOfStudy: '',
    phoneNumber: '',
    country: '',
    techSkills: {
      coding: false,
      remoteSensing: false,
      gis: false,
      iot: false,
      other: '',
    },
    previousHackathonExperience: '',
    githubUrl: '',
    personalWebsite: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const userData = await response.json();
        setFormData(userData);
      } catch (error) {
        toast.error('Failed to load profile');
        console.error('Error loading profile:', error);
      }
    };

    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('techSkills.')) {
      const skill = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        techSkills: {
          ...prev.techSkills,
          [skill]: e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      await update();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium">Institution</label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium">Department/Faculty</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium">Major/Field of Study</label>
            <input
              type="text"
              id="fieldOfStudy"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yearOfStudy" className="block text-sm font-medium">Year of Study</label>
            <input
              type="text"
              id="yearOfStudy"
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-semibold">Hackathon-Specific Information</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Tech Skills</label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="coding"
                name="techSkills.coding"
                checked={formData.techSkills.coding}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label htmlFor="coding">Coding</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remoteSensing"
                name="techSkills.remoteSensing"
                checked={formData.techSkills.remoteSensing}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label htmlFor="remoteSensing">Remote Sensing</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="gis"
                name="techSkills.gis"
                checked={formData.techSkills.gis}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label htmlFor="gis">GIS</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="iot"
                name="techSkills.iot"
                checked={formData.techSkills.iot}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label htmlFor="iot">IoT</label>
            </div>
            <div>
              <label htmlFor="otherSkills" className="block text-sm font-medium">Other Skills</label>
              <input
                type="text"
                id="otherSkills"
                name="techSkills.other"
                value={formData.techSkills.other || ''}
                onChange={handleInputChange}
                placeholder="Specify other skills"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="previousHackathonExperience" className="block text-sm font-medium">Previous Hackathon Experience</label>
          <textarea
            id="previousHackathonExperience"
            name="previousHackathonExperience"
            value={formData.previousHackathonExperience}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium">GitHub Profile URL</label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleInputChange}
            placeholder="https://github.com/username"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="personalWebsite" className="block text-sm font-medium">Personal Website (Optional)</label>
          <input
            type="url"
            id="personalWebsite"
            name="personalWebsite"
            value={formData.personalWebsite}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium">LinkedIn Profile (Optional)</label>
          <input
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/username"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export { UserProfile };
export default UserProfile; 