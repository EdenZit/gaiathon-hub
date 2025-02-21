'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface VerificationBannerProps {
  email: string;
}

export function VerificationBanner({ email }: VerificationBannerProps) {
  const [isSending, setIsSending] = useState(false);

  const handleResendVerification = async () => {
    try {
      setIsSending(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend verification email');
      }

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-yellow-700">
            Please verify your email address to unlock all features.
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            A verification email has been sent to {email}
          </p>
        </div>
        <button
          onClick={handleResendVerification}
          disabled={isSending}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            isSending
              ? 'bg-yellow-100 text-yellow-400 cursor-not-allowed'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          }`}
        >
          {isSending ? 'Sending...' : 'Resend Email'}
        </button>
      </div>
    </div>
  );
} 