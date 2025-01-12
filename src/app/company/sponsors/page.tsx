import { Metadata } from 'next';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa6';

export const metadata: Metadata = {
  title: 'Our Sponsors - GAIAthon-Hub',
  description: 'Meet the organizations that support the GAIA Initiative by Edenway Foundation.',
};

export default function SponsorsPage() {
  const sponsors = [
    {
      name: 'Edenway Foundation',
      logo: '/images/sponsors/edenway-logo.png', // Add your logo here
      hasArrow: true,
    },
    {
      name: 'GMES and Africa',
      logo: '/images/sponsors/gmes-africa-logo.png', // Add your logo here
      description: 'The Global Monitoring for Environment and Security and Africa',
      hasArrow: false,
    },
    {
      name: 'African Union Commission',
      logo: '/images/sponsors/au-commission-logo.png', // Add your logo here
      hasArrow: true,
    },
    {
      name: 'European Union Commission',
      logo: '/images/sponsors/eu-commission-logo.png', // Add your logo here
      hasArrow: true,
    },
    {
      name: 'Regional Marine Center, University of Ghana',
      logo: '/images/sponsors/ug-marine-center-logo.png', // Add your logo here
      hasArrow: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-center">
            Our Sponsors
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-100 text-center">
            The realization of the GAIA Initiative, developed by Edenway Foundation, has been made possible 
            through the invaluable support of our dedicated sponsors who wholeheartedly embraced and believed 
            in our vision.
          </p>
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="relative h-24 w-48">
                      <Image
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    {sponsor.hasArrow && (
                      <FaArrowRight className="h-6 w-6 text-green-600" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {sponsor.name}
                  </h3>
                  {sponsor.description && (
                    <p className="mt-2 text-base text-gray-500">
                      {sponsor.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Interested in Supporting GAIA?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join our mission to empower communities through Earth Observation technology.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 