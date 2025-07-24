import { motion } from 'framer-motion';
import { FaUsers, FaLightbulb, FaTrophy, FaBuildingColumns } from 'react-icons/fa6';
import { CountdownBanner } from './CountdownBanner';

interface Team {
  name: string;
  topic: string;
}

interface Institution {
  country: string;
  name: string;
  teams: Team[];
}

const institutions: Institution[] = [
  {
    country: 'Benin',
    name: 'National University of Sciences, Technologies, Engineering, and Mathematics',
    teams: [
      { name: 'Sustainable Innovators', topic: 'Floating IoT device monitoring for coastal water quality' }
    ]
  },
  {
    country: 'Cameroon',
    name: 'University de Dschang',
    teams: [
      { name: 'Green Pulse', topic: 'Hydroponics and IoT for fodder production' }
    ]
  },
  {
    country: 'Egypt',
    name: 'The British University of Egypt',
    teams: [
      { name: 'Pharaonic Minds', topic: 'Sustainable Agriculture From Recovered Harm' }
    ]
  },
  {
    country: 'Ethiopia',
    name: 'Addis Ababa Science and Technology University',
    teams: [
      { name: 'EcoFarmIQ', topic: 'AI-Powered Crop Recommendation and farm Monitoring system' }
    ]
  },
  {
    country: 'Ghana',
    name: 'University of Ghana',
    teams: [
      { name: 'Mavericks', topic: 'AQUAGUARD water quality monitoring system' }
    ]
  },
  {
    country: 'Ghana',
    name: 'Kwame Nkrumah University of Science and Technology',
    teams: [
      { name: 'CAD', topic: 'Smart IoT Device for real-time particulate matter monitoring' }
    ]
  },
  {
    country: 'Ghana',
    name: 'University of Mines and Technology',
    teams: [
      { name: 'Intellectual Powerhouse', topic: 'Powerhive real-time AI-powered hybrid renewable energy system' }
    ]
  },
  {
    country: 'Ghana',
    name: 'Ghana Communication Technology University',
    teams: [
      { name: 'GCTU-XI', topic: 'AquaSentinel Smart Water Monitoring Module' }
    ]
  },
  {
    country: 'Kenya',
    name: 'Technical University of Kenya',
    teams: [
      { name: 'Geovisionaries', topic: 'GreenMap web-based mapping tool' }
    ]
  },
  {
    country: 'Malawi',
    name: 'University of Business and Applied Sciences',
    teams: [
      { name: 'Zeroday', topic: 'Tisese Blantyre Waste Management Optimizer' }
    ]
  },
  {
    country: 'Nigeria',
    name: 'Obafemi Awolowo University & Federal University of Technology Akure',
    teams: [
      { name: 'Team_FUTA', topic: 'IoT-enabled smart system to mitigate coastal hazards' }
    ]
  },
  {
    country: 'Senegal',
    name: 'Universite Cheikh Anta Diop',
    teams: [
      { name: 'IUPA-LaboEA', topic: 'Aquaculture water quality monitoring system' }
    ]
  },
  {
    country: 'Togo',
    name: 'Université de Lomé',
    teams: [
      { name: 'Terra Vigil', topic: 'IoT-Based Early Detection System for Bushfires' }
    ]
  },
  {
    country: 'Tunisia',
    name: 'Higher School of Communication',
    teams: [
      { name: 'Tak_Tic', topic: 'CarbonSense carbon emission monitoring system' }
    ]
  },
  {
    country: 'Uganda',
    name: 'Makerere University',
    teams: [
      { name: 'NextGen Geominds', topic: 'Smart irrigation adviser' }
    ]
  }
];

export function GAIAthonResults() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <FaTrophy className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            GAIAthon'25 Finalists
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Round Two of GAIAthon'25 ended on 27 June 2025. From 112 teams across 16 universities, 
            15 finalists will compete for the trophy at the GAIAfest Awards on 20 August in Accra.
          </p>
        </motion.div>

        <CountdownBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {institutions.map((institution, index) => (
            <motion.div
              key={institution.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FaBuildingColumns className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{institution.name}</h3>
                    <p className="text-sm text-gray-600">{institution.country}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {institution.teams.map((team, teamIndex) => (
                    <div key={team.name} className="flex items-start">
                      <FaUsers className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{team.name}</h4>
                        <div className="flex items-center mt-1">
                          <FaLightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                          <p className="text-sm text-gray-600">{team.topic}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 