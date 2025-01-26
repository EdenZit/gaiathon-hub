'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlobeAltIcon, CloudIcon } from '@heroicons/react/24/outline';

const platforms = [
  {
    name: "WEkEO Platform",
    description: "Access Copernicus data and services through WEkEO, the EU's Earth Observation hub.",
    url: "https://www.wekeo.eu/",
    icon: GlobeAltIcon,
    signupMessage: "Sign up for WEkEO to access Earth Observation data and tools.",
    color: "bg-blue-600 hover:bg-blue-700"
  },
  {
    name: "Dunia Platform",
    description: "Explore and analyze Earth Observation data with Dunia's powerful tools.",
    url: "https://dunia.esa.int/",
    icon: CloudIcon,
    signupMessage: "Create a Dunia account to start analyzing Earth Observation data.",
    color: "bg-green-600 hover:bg-green-700"
  }
];

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'unauthenticated') {
    router.push('/register');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Earth Observation Platforms
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Access powerful Earth Observation tools and datasets through our partner platforms
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="relative group bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <platform.icon className="h-8 w-8 text-gray-600" />
                <h3 className="ml-4 text-xl font-medium text-gray-900">{platform.name}</h3>
              </div>
              <p className="mt-4 text-gray-500">{platform.description}</p>
              <div className="mt-6 space-y-4">
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center text-white px-4 py-2 rounded transition-colors ${platform.color}`}
                >
                  Access Platform
                </a>
                <p className="text-sm text-gray-500 text-center">{platform.signupMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 