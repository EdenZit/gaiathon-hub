'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';

export default function MaintenancePage() {
  // Log that the maintenance page was accessed
  useEffect(() => {
    console.log('Maintenance page accessed');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-navy-600 p-6 flex justify-center">
          <div className="relative h-16 w-48">
            <Image 
              src="/images/logo.png" 
              alt="GAIAthon Hub Logo" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>
        
        <div className="p-8">
          <div className="flex items-center justify-center mb-6 text-navy-600">
            <AlertCircle size={32} className="mr-2" />
            <h1 className="text-3xl font-bold">Scheduled Maintenance</h1>
          </div>
          
          <div className="mb-8 text-center">
            <p className="text-xl text-gray-700 mb-4">
              We're currently improving the GAIAthon Hub platform to serve you better.
            </p>
            <p className="text-gray-600">
              Our team is working diligently to implement new features and improvements. 
              We apologize for any inconvenience and appreciate your patience.
            </p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Expected Duration</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>We expect to be back online shortly. Most maintenance windows are completed within 1-2 hours.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">While you wait:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <ArrowRight size={18} className="mr-2 mt-1 text-navy-600 flex-shrink-0" />
                <span>Follow us on social media for real-time updates</span>
              </li>
              <li className="flex items-start">
                <ArrowRight size={18} className="mr-2 mt-1 text-navy-600 flex-shrink-0" />
                <span>Check our blog for the latest Earth Observation news</span>
              </li>
              <li className="flex items-start">
                <ArrowRight size={18} className="mr-2 mt-1 text-navy-600 flex-shrink-0" />
                <span>Bookmark this page to easily return when we're back online</span>
              </li>
            </ul>
          </div>
          
          <div className="text-center text-gray-600 text-sm">
            <p>Thank you for your understanding and continued support.</p>
            <p className="mt-2">
              If you need immediate assistance, please contact us at{' '}
              <a href="mailto:support@gaiathon-hub.com" className="text-navy-600 hover:underline">
                support@gaiathon-hub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 