'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  // Log the 404 error for monitoring purposes, but don't expose details to the user
  useEffect(() => {
    console.error('404 error: Page not found');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-navy-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">Page Not Found</h1>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="text-navy-600 text-8xl font-bold">404</div>
          </div>
          
          <p className="text-gray-700 mb-4 text-center">
            The page you're looking for may have been moved, deleted, or might never have existed.
          </p>
          
          <div className="space-y-2 text-gray-600 mb-6">
            <p className="text-sm">This could be due to:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Content that has been recently removed</li>
              <li>A mistyped URL</li>
              <li>A broken link from another site</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors"
            >
              <Home size={18} />
              <span>Go to Home</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center justify-center gap-2 px-4 py-2 border border-navy-600 text-navy-600 rounded-md hover:bg-navy-50 transition-colors"
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