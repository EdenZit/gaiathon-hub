'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface University {
  name: string;
  country: string;
  website?: string;
}

interface Region {
  name: string;
  institutions: University[];
}

const regions: Region[] = [
  {
    name: "NORTHERN AFRICA",
    institutions: [
      { name: "Higher School of Communication", country: "TUNISIA", website: "https://www.supcom.tn/" },
      { name: "The British University of Egypt", country: "EGYPT", website: "https://www.bue.edu.eg/" }
    ]
  },
  {
    name: "WESTERN AFRICA",
    institutions: [
      { name: "Université Félix Houphouët-Boigny", country: "COTE D'VOIRE", website: "https://univ-cocody.ci/" },
      { name: "University of Ghana", country: "GHANA", website: "https://www.ug.edu.gh/" },
      { name: "University of Mines and Technology", country: "GHANA", website: "https://umat.edu.gh/" },
      { name: "Ghana Communication Technology University", country: "GHANA", website: "https://site.gctu.edu.gh/" },
      { name: "Kwame Nkrumah University of Science and Technology", country: "GHANA", website: "https://www.knust.edu.gh/" },
      { name: "Obafemi Awolowo University", country: "NIGERIA", website: "https://oauife.edu.ng/" },
      { name: "Université de Lomé", country: "TOGO", website: "https://univ-lome.tg/" },
      { name: "Universite Cheikh Anta Diop", country: "SENEGAL", website: "https://www.ucad.sn/" },
      { name: "L'Université Nationale des Sciences, Technologies, Ingénieriecet Mathématiques", country: "BENIN", website: "https://www.unstim.bj/" }
    ]
  },
  {
    name: "EASTERN AFRICA",
    institutions: [
      { name: "Makerere University", country: "UGANDA", website: "https://mak.ac.ug/" },
      { name: "Addis Ababa Science and Technology University", country: "ETHIOPIA", website: "https://www.aastu.edu.et/" },
      { name: "Technical University of Kenya", country: "KENYA", website: "https://tukenya.ac.ke/" }
    ]
  },
  {
    name: "CENTRAL AFRICA",
    institutions: [
      { name: "University de Dschang", country: "CAMEROON", website: "https://www.univ-dschang.org/" }
    ]
  },
  {
    name: "SOUTHERN AFRICA",
    institutions: [
      { name: "Malawi University of Business and Applied Sciences", country: "MALAWI", website: "https://www.mubas.ac.mw/" }
    ]
  }
];

export default function ParticipatingCountriesPage() {
  const [countries, setCountries] = useState<University[]>([]);
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
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-200"
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

        <div className="space-y-12">
          {regions.map((region, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-blue-900 mb-8 pb-4 border-b-2 border-blue-100">
                {region.name}
              </h2>
              <div className="grid gap-6">
                {region.institutions.map((institution, idx) => (
                  <div 
                    key={idx} 
                    className="group hover:bg-blue-50 p-4 rounded-xl transition-all duration-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-200">
                      {institution.website ? (
                        <a 
                          href={institution.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {institution.name}
                        </a>
                      ) : (
                        institution.name
                      )}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {institution.country}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p className="text-lg">More universities and countries will be added as registrations continue.</p>
          <p className="mt-4">
            Want your university to participate? {' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
} 