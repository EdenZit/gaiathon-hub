'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to server
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-navy-600 p-6">
              <h1 className="text-2xl font-bold text-white text-center">Critical Error</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 text-center">
                We're sorry, but something went seriously wrong. Our team has been notified and is working on a fix.
              </p>
              
              <div className="flex justify-center">
                <button
                  onClick={() => reset()}
                  className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 