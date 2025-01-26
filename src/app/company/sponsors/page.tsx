import { Metadata } from 'next';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa6';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Partners - GAIAthon-Hub',
  description: 'Meet the organizations that support and collaborate with the GAIA Initiative.',
};

export default function PartnersPage() {
  const partners = [
    {
      name: 'GMES and Africa',
      logo: '/images/sponsors/gmes.png',
      description: 'The Global Monitoring for Environment and Security and Africa',
      hasArrow: true,
      website: 'http://gmes.africa-union.org/',
    },
    {
      name: 'African Union Commission',
      logo: '/images/sponsors/auc.png',
      hasArrow: true,
      website: 'https://au.int/en/commission',
    },
    {
      name: 'European Commission',
      logo: '/images/sponsors/eu.png',
      hasArrow: true,
      website: 'https://commission.europa.eu/index_en',
    },
    {
      name: 'Regional Marine Center, University of Ghana',
      logo: '/images/sponsors/rmc.png',
      hasArrow: true,
      website: 'https://gmes.rmc.africa/',
    },
    {
      name: 'European Space Agency (ESA)',
      logo: '/images/partners/esa.png',
      hasArrow: true,
      website: 'https://www.esa.int/',
    },
    {
      name: 'EUMETSAT',
      logo: '/images/partners/eumetsat.png',
      hasArrow: true,
      website: 'https://www.eumetsat.int/',
    },
    {
      name: 'Joint Research Centre (JRC)',
      logo: '/images/partners/jrc.png',
      hasArrow: true,
      website: 'https://commission.europa.eu/index_en',
    },
    {
      name: 'Mercator Ocean International',
      logo: '/images/partners/mercator.png',
      hasArrow: true,
      website: 'https://www.mercator-ocean.eu',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-center">
            Our Partners
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-100 text-center">
            The success of the GAIA Initiative is built on strong partnerships with leading organizations 
            in Earth Observation, environmental monitoring, and technological innovation.
          </p>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
            {partners.map((partner) => (
              <Link
                key={partner.name}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl">
                  <div className="p-8">
                    <div className="flex items-center justify-between">
                      <div className="relative h-24 w-48">
                        <Image
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      {partner.hasArrow && (
                        <FaArrowRight className="h-6 w-6 text-green-600" aria-hidden="true" />
                      )}
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-gray-900">
                      {partner.name}
                    </h3>
                    {partner.description && (
                      <p className="mt-2 text-base text-gray-500">
                        {partner.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Interested in Partnering with GAIA?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join our mission to empower African communities through Earth Observation technology.
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