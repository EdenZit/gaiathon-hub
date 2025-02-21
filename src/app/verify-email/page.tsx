'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setVerificationStatus('error');
          setErrorMessage('Verification token is missing');
          return;
        }

        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setVerificationStatus('success');
        toast.success('Email verified successfully!');
        
        // Delay redirect to allow user to see the success message
        setTimeout(() => {
          router.push('/dashboard/profile');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {verificationStatus === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">
              Your email has been successfully verified. You will be redirected to your profile page shortly.
            </p>
            <Link 
              href="/dashboard/profile"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Profile →
            </Link>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
            <p className="text-red-600">{errorMessage}</p>
            <div className="mt-6 space-y-2">
              <Link 
                href="/dashboard/profile"
                className="block text-blue-600 hover:text-blue-800 font-medium"
              >
                Return to Profile
              </Link>
              <button
                onClick={() => router.refresh()}
                className="text-gray-600 hover:text-gray-800"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 