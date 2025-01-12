'use client';

import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const platforms = [
  {
    name: 'WEkEO',
    description: 'Access Copernicus data and cloud computing resources',
    url: 'https://www.wekeo.eu',
    signupMessage: 'Sign up to use WEkEO',
    imagePath: '/images/logo.png',
  },
  {
    name: 'Dunia',
    description: 'ESA Earth Observation Platform',
    url: 'https://dunia.esa.int',
    signupMessage: 'Sign up to use Dunia',
    imagePath: '/images/logo.png',
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-2xl font-bold leading-6 text-gray-900">
          Earth Observation Tools
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Access powerful Earth Observation platforms to process and analyze data.
        </p>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 h-12 w-12 relative">
                  <Image
                    src={platform.imagePath}
                    alt={`${platform.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Access Platform
                  <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
                </a>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {platform.name}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {platform.description}
                </p>
                <p className="mt-2 text-sm text-blue-600">
                  {platform.signupMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900">
          Getting Started
        </h4>
        <p className="mt-2 text-sm text-gray-500">
          To use these platforms, you&apos;ll need to:
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm text-gray-500 space-y-2">
          <li>Create an account on the respective platform</li>
          <li>Generate API keys for programmatic access</li>
          <li>Add your API keys to your GAIAthon-Hub profile</li>
          <li>Follow platform-specific documentation for data access</li>
        </ul>
      </div>
    </div>
  );
} 