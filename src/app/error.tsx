'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error for monitoring purposes, but don't expose details to the user
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-navy-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">Something Went Wrong</h1>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-6 text-center">
            We encountered an unexpected issue while processing your request. Our team has been notified.
          </p>
          
          <div className="space-y-2 text-gray-600 mb-6">
            <p className="text-sm">You can try:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Refreshing the page</li>
              <li>Going back to the previous page</li>
              <li>Returning to the home page</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
            
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Home size={18} />
              <span>Go to Home</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 