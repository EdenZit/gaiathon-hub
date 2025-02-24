import Image from 'next/image';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const partners = [
  {
    name: 'GMES and Africa',
    logo: '/images/sponsors/gmes.png',
    description: 'The Global Monitoring for Environment and Security and Africa',
    hasArrow: true,
    website: 'https://au.int/GMESAfrica',
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

export function Partners() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mt-20"
    >
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Partners</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {partners.map((partner) => (
          <Link
            key={partner.name}
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block transform transition-all duration-300 hover:-translate-y-1"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md p-4 h-full flex flex-col justify-between">
              <div className="relative h-20 w-full mb-4">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {partner.name}
                </h4>
                {partner.hasArrow && (
                  <FaArrowRight className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
} 