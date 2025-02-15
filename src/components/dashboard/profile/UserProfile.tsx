'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface TechSkills {
  coding: boolean;
  remoteSensing: boolean;
  gis: boolean;
  iot: boolean;
  other?: string;
}

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  department: string | null;
  location: string | null;
  contactInfo: string | null;
  bio: string | null;
  phoneNumber: string | null;
  techSkills: TechSkills;
  fieldOfStudy: string;
  yearOfStudy: string;
  country: string;
  gender: string;
  previousHackathonExperience: string;
  githubUrl?: string;
  personalWebsite?: string;
  linkedinUrl?: string;
  teamRole: 'leader' | 'member';
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialFormData: UserProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  institution: '',
  department: null,
  location: null,
  contactInfo: null,
  bio: null,
  phoneNumber: null,
  techSkills: {
    coding: false,
    remoteSensing: false,
    gis: false,
    iot: false,
    other: '',
  },
  fieldOfStudy: '',
  yearOfStudy: '',
  country: '',
  gender: '',
  previousHackathonExperience: '',
  githubUrl: '',
  personalWebsite: '',
  linkedinUrl: '',
  teamRole: 'member',
};

export default function UserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>(initialFormData);
  const { data: session, update } = useSession();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    if (!session?.user?.email) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const userData = await response.json();
      console.log('Fetched user data:', userData);
      
      if (!userData) {
        throw new Error('No user data received');
      }

      // Update form data with fetched user data
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        institution: userData.institution || '',
        department: userData.department,
        location: userData.location,
        contactInfo: userData.contactInfo,
        bio: userData.bio,
        phoneNumber: userData.phoneNumber,
        techSkills: {
          coding: userData.techSkills?.coding || false,
          remoteSensing: userData.techSkills?.remoteSensing || false,
          gis: userData.techSkills?.gis || false,
          iot: userData.techSkills?.iot || false,
          other: userData.techSkills?.other || '',
        },
        fieldOfStudy: userData.fieldOfStudy || '',
        yearOfStudy: userData.yearOfStudy || '',
        country: userData.country || '',
        gender: userData.gender || '',
        previousHackathonExperience: userData.previousHackathonExperience || '',
        githubUrl: userData.githubUrl || '',
        personalWebsite: userData.personalWebsite || '',
        linkedinUrl: userData.linkedinUrl || '',
        teamRole: userData.teamRole || 'member',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data when component mounts or session changes
  useEffect(() => {
    console.log('UserProfile: Fetching profile data...');
    fetchProfile();
  }, [session?.user?.email]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!isEditMode) return;
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name.startsWith('techSkills.')) {
      const skill = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        techSkills: {
          ...prev.techSkills,
          [skill]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }

    setIsLoading(true);

    try {
      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        institution: formData.institution.trim(),
        department: formData.department?.trim() || null,
        location: formData.location?.trim() || null,
        contactInfo: formData.contactInfo?.trim() || null,
        bio: formData.bio?.trim() || null,
        phoneNumber: formData.phoneNumber?.trim() || null,
        fieldOfStudy: formData.fieldOfStudy.trim(),
        yearOfStudy: formData.yearOfStudy,
        country: formData.country.trim(),
        gender: formData.gender.trim(),
        previousHackathonExperience: formData.previousHackathonExperience.trim(),
        githubUrl: formData.githubUrl?.trim() || '',
        personalWebsite: formData.personalWebsite?.trim() || '',
        linkedinUrl: formData.linkedinUrl?.trim() || '',
        techSkills: formData.techSkills,
        teamRole: formData.teamRole,
      };

      console.log('Sending profile update data:', apiData);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details) {
          const errorMessages = errorData.details
            .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Profile update response:', result);

      if (result.user) {
        setFormData(prevData => ({
          ...prevData,
          ...result.user,
          techSkills: {
            ...prevData.techSkills,
            ...(result.user.techSkills || {}),
          },
        }));
      }

      await update();
      await fetchProfile();
      setIsEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInputProps = (name: keyof UserProfileData, required: boolean = false) => {
    const value = formData[name];
    return {
      name,
      value: typeof value === 'string' ? value : '',
      onChange: handleInputChange,
      required,
      disabled: !isEditMode,
      className: `mt-1 block w-full rounded-md border ${
        isEditMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
      } px-3 py-2`
    };
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile Information</h2>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium
              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 disabled:bg-gray-100"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="teamRole" className="block text-sm font-medium text-gray-700">
                  Team Role
                </label>
                <select
                  name="teamRole"
                  id="teamRole"
                  value={formData.teamRole}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-navy-500 focus:outline-none focus:ring-navy-500 disabled:bg-gray-100"
                >
                  <option value="member">Team Member</option>
                  <option value="leader">Team Leader</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.teamRole === 'leader' 
                    ? 'As a team leader, you can create and manage teams.'
                    : 'As a team member, you can join existing teams.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="institution" className="block text-sm font-medium">Institution</label>
                <input
                  type="text"
                  id="institution"
                  {...getInputProps('institution', true)}
                />
              </div>

              <div>
                <label htmlFor="fieldOfStudy" className="block text-sm font-medium">Major/Field of Study</label>
                <input
                  type="text"
                  id="fieldOfStudy"
                  {...getInputProps('fieldOfStudy', true)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="yearOfStudy" className="block text-sm font-medium">Year of Study</label>
                <select
                  id="yearOfStudy"
                  {...getInputProps('yearOfStudy', true)}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                  <option value="graduate">Graduate Student</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  {...getInputProps('phoneNumber')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium">Country</label>
                <input
                  type="text"
                  id="country"
                  {...getInputProps('country', true)}
                  placeholder="Enter your country"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium">City/Region (Optional)</label>
                <input
                  type="text"
                  id="location"
                  {...getInputProps('location')}
                  placeholder="Enter your city or region"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Skills</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="coding"
                  name="techSkills.coding"
                  checked={formData.techSkills.coding}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
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
                  disabled={!isEditMode}
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
                  disabled={!isEditMode}
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
                  disabled={!isEditMode}
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
                  disabled={!isEditMode}
                  placeholder="Enter other technical skills"
                  className={`mt-1 block w-full rounded-md border ${
                    isEditMode ? 'border-gray-300' : 'border-transparent bg-gray-50'
                  } px-3 py-2`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Experience & Links</h3>
            
            <div>
              <label htmlFor="previousHackathonExperience" className="block text-sm font-medium">
                Previous Hackathon Experience (Optional)
              </label>
              <textarea
                id="previousHackathonExperience"
                {...getInputProps('previousHackathonExperience')}
                rows={3}
                placeholder="Share your previous hackathon experiences..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium">GitHub Profile URL (Optional)</label>
                <input
                  type="url"
                  id="githubUrl"
                  {...getInputProps('githubUrl')}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label htmlFor="personalWebsite" className="block text-sm font-medium">Personal Website (Optional)</label>
                <input
                  type="url"
                  id="personalWebsite"
                  {...getInputProps('personalWebsite')}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium">LinkedIn Profile URL (Optional)</label>
                <input
                  type="url"
                  id="linkedinUrl"
                  {...getInputProps('linkedinUrl')}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
              <textarea
                id="bio"
                {...getInputProps('bio')}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium">Additional Contact Information</label>
              <textarea
                id="contactInfo"
                {...getInputProps('contactInfo')}
                rows={2}
                placeholder="Any additional contact information..."
              />
            </div>
          </div>
        </div>
      </form>

      <div className="mt-10 pt-10 border-t border-gray-200">
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Change Password</h2>
            <button
              type="submit"
              disabled={isChangingPassword}
              className={`px-4 py-2 rounded-md text-white font-medium
                ${isChangingPassword ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 