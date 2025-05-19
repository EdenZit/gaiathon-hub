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
    name: 'African Space Agency',
    logo: '/images/partners/afsa.png',
    hasArrow: true,
    website: 'https://africanspaceagency.org',
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
  {
    name: 'US Embassy Ghana',
    logo: '/images/partners/usembassy.png',
    hasArrow: true,
    website: 'https://gh.usembassy.gov',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function Partners() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Our Partners
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Collaborating with leading organizations to drive innovation in Earth Observation
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              className="relative group"
            >
              <Link
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative">
                  {/* Gradient Border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
                  
                  {/* Content */}
                  <div className="relative bg-white rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {/* Logo Container */}
                    <div className="relative h-24 mb-4">
                      <Image
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        fill
                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                    
                    {/* Partner Info */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {partner.name}
                      </h3>
                      {partner.hasArrow && (
                        <FaArrowRight 
                          className="h-4 w-4 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 transition-all duration-300" 
                          aria-hidden="true" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 