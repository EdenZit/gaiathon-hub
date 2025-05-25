import { motion } from 'framer-motion';
import { FaUsers, FaLightbulb, FaTrophy, FaBuildingColumns } from 'react-icons/fa6';

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
      { name: 'World Well Being Defenders', topic: 'Climate data portal for impact analysis and policy use' },
      { name: 'Sustainable Innovators', topic: 'Floating IoT device monitoring for coastal water quality' },
      { name: 'SymplTech', topic: 'Intelligent system for detecting and monitoring pollution levels' }
    ]
  },
  {
    country: 'Cameroon',
    name: 'University de Dschang',
    teams: [
      { name: 'Green Pulse', topic: 'Hydroponics and IoT for fodder production' },
      { name: 'Spatial Innovation', topic: 'Landslide assessment using spatial intelligence' },
      { name: 'Dschang', topic: 'Mapping environmental impacts of industrial mining' }
    ]
  },
  {
    country: 'Egypt',
    name: 'The British University of Egypt',
    teams: [
      { name: 'Pharaonic Minds', topic: 'Sustainable Agriculture From Recovered Harm' },
      { name: 'Afribot Firepatrol', topic: 'Fire detection and monitoring system' },
      { name: 'Flutter Force', topic: 'Recycling for a Sustainable Future' }
    ]
  },
  {
    country: 'Ethiopia',
    name: 'Addis Ababa Science and Technology University',
    teams: [
      { name: 'EcoFarmIQ', topic: 'AI-Powered Crop Recommendation and farm Monitoring system' },
      { name: 'The Shakeless 60', topic: 'Early Earthquake Detection System with IOT' },
      { name: 'CashMate', topic: 'IoT-Enabled Smart Systems - A Maternal Health Platform' }
    ]
  },
  {
    country: 'Ghana',
    name: 'University of Ghana',
    teams: [
      { name: 'Mavericks', topic: 'AQUAGUARD water quality monitoring system' },
      { name: 'Source Code', topic: 'FarmSight Real-time crop intelligence using satellite data & AI' },
      { name: 'Tide Watch', topic: 'Coastal flood monitoring system' }
    ]
  },
  {
    country: 'Ghana',
    name: 'Kwame Nkrumah University of Science and Technology',
    teams: [
      { name: 'Code Verse', topic: 'FloodPredict mobile flood detection system' },
      { name: 'CAD', topic: 'Smart IoT Device for real-time particulate matter monitoring' },
      { name: 'GNADE', topic: 'AeroHealth air quality monitoring app' }
    ]
  },
  {
    country: 'Ghana',
    name: 'University of Mines and Technology',
    teams: [
      { name: 'AQUAFIX', topic: 'IoT-Based smart aquaculture system' },
      { name: 'Intellectual Powerhouse', topic: 'Powerhive real-time AI-powered hybrid renewable energy system' },
      { name: 'Impact Team', topic: 'IoT-Based Smart Solar Panel Optimization' }
    ]
  },
  {
    country: 'Ghana',
    name: 'Ghana Communication Technology University',
    teams: [
      { name: 'Team FixiMami', topic: 'HighSafe smart accident alert system' },
      { name: 'GCTU Team-3', topic: 'TerraPlan Smart Land-Use Intelligence Platform' },
      { name: 'GCTU-XI', topic: 'AquaSentinel Smart Water Monitoring Module' }
    ]
  },
  {
    country: 'Kenya',
    name: 'Technical University of Kenya',
    teams: [
      { name: 'Geovisionaries', topic: 'GreenMap web-based mapping tool' },
      { name: 'DIJI', topic: 'Mehthane monitoring system' },
      { name: 'Infinity Sentinels', topic: 'NovaBox vehicle safety app' }
    ]
  },
  {
    country: 'Malawi',
    name: 'University of Business and Applied Sciences',
    teams: [
      { name: 'Zeroday', topic: 'Tisese Blantyre Waste Management Optimizer' },
      { name: 'Build Green', topic: 'Waste Management Optimizer' },
      { name: 'Tech Titans', topic: 'Urban Expansion Analysis Dashboard' }
    ]
  },
  {
    country: 'Nigeria',
    name: 'Obafemi Awolowo University & Federal University of Technology Akure',
    teams: [
      { name: 'Delta_X', topic: 'Green Guard Carbon Footprint Tracker' },
      { name: 'Team_FUTA', topic: 'IoT-enabled smart system to mitigate coastal hazards' },
      { name: 'GAIATorch', topic: 'Weather-Intelligent Smart Irrigation System' }
    ]
  },
  {
    country: 'Senegal',
    name: 'Universite Cheikh Anta Diop',
    teams: [
      { name: 'SIRIUS', topic: 'Agro Teranga AI system' },
      { name: 'IUPA-LaboEA', topic: 'Aquaculture water quality monitoring system' },
      { name: 'VIGIMANG', topic: 'RFID Wristbands for Enhancing Bathers\' Safety' }
    ]
  },
  {
    country: 'Togo',
    name: 'Université de Lomé',
    teams: [
      { name: 'Terra Vigil', topic: 'IoT-Based Early Detection System for Bushfires' },
      { name: 'AlerionAqua', topic: 'Smart monitoring for sustainable Aquaculture' },
      { name: 'Bitecrafters', topic: 'Digital Platforms and Interactive Applications for Waste Management' }
    ]
  },
  {
    country: 'Tunisia',
    name: 'Higher School of Communication',
    teams: [
      { name: 'Tak_Tic', topic: 'CarbonSense carbon emission monitoring system' },
      { name: 'Nexus', topic: 'Intelligentcoastal monitoring and potential fishing zone prediction system' },
      { name: 'G-Code', topic: 'B-ZOU plastic waste monitoring system' }
    ]
  },
  {
    country: 'Uganda',
    name: 'Makerere University',
    teams: [
      { name: 'GeoSpech', topic: 'Flood risk early warning app' },
      { name: 'GeoSmart Agric Solutions', topic: 'Smart agricultural monitoring system' },
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
            GAIAthon'25: 45 Teams Advance to the Next Stage
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Round One of GAIAthon'25 concluded on 23 May 2025. From 112 teams across 15 universities, 
            45 top teams have advanced to develop their solutions by 27 June 2025.
          </p>
        </motion.div>

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