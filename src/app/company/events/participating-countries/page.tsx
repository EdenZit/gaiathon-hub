'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Country {
  name: string;
  universities: string[];
}

export default function ParticipatingCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/events/participating-countries');
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to load participating countries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link 
            href="/company/events" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Events
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
            Participating Countries
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the diverse community of universities participating in GAIAthon'25
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : countries.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {countries.map((country, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{country.name}</h2>
                <ul className="space-y-2">
                  {country.universities.map((university, uIndex) => (
                    <li 
                      key={uIndex}
                      className="text-gray-700 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      {university}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No participating countries registered yet.</p>
          </div>
        )}

        <div className="mt-16 text-center text-gray-600">
          <p>More universities and countries will be added as registrations continue.</p>
          <p className="mt-2">
            Want your university to participate? {' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
} 