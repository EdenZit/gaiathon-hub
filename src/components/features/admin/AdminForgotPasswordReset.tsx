'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AdminForgotPasswordResetProps {
  userEmail: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdminForgotPasswordReset({ userEmail, onSuccess, onCancel }: AdminForgotPasswordResetProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          newPassword,
          reason: reason || 'User forgot password and security question'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      toast.success('Password reset successful');
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      setReason('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while resetting password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Reset Forgotten Password</h2>
      <p className="text-gray-600 mb-6">
        Reset password for user: <span className="font-medium">{userEmail}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Reset
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="User forgot password and security question"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={2}
          />
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium
              ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> This will bypass the security question verification and immediately reset the user's password. 
                Use this only when a user has forgotten both their password and security question answer.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 