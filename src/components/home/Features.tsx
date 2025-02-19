'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  DevicePhoneMobileIcon, 
  CpuChipIcon, 
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const winners = [
  { id: 1, name: 'Team EcoWatch', project: 'Coastal Monitoring System', image: '/images/winners/team1.jpg' },
  { id: 2, name: 'AquaGuard', project: 'Water Quality Analysis', image: '/images/winners/team2.jpg' },
  { id: 3, name: 'GreenSense', project: 'Forest Cover Tracking', image: '/images/winners/team3.jpg' },
  { id: 4, name: 'AgriTech', project: 'Crop Yield Prediction', image: '/images/winners/team4.jpg' },
  { id: 5, name: 'UrbanPulse', project: 'Urban Heat Mapping', image: '/images/winners/team5.jpg' },
  { id: 6, name: 'ClimateAI', project: 'Climate Change Analysis', image: '/images/winners/team6.jpg' },
  { id: 7, name: 'EarthSense', project: 'Soil Health Monitoring', image: '/images/winners/team7.jpg' },
];

const categories = [
  {
    title: 'Digital Platforms and Interactive Applications',
    description: 'Innovative web and mobile applications designed to process, analyse, and visualise Earth observation (EO) data and IoT insights for decision-making and user engagement',
    icon: DevicePhoneMobileIcon,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'IoT-Enabled Smart Systems',
    description: 'Integrated IoT solutions that leverage sensors and real-time data transmission, complemented by interactive dashboards for monitoring, automation, and actionable insights',
    icon: CpuChipIcon,
    color: 'from-emerald-500 to-green-500'
  },
  {
    title: 'Geospatial Intelligence and Policy Innovation',
    description: 'Solutions that utilise EO data for mapping, spatial analysis, and evidence-based policy recommendations to address environmental and societal challenges',
    icon: GlobeAltIcon,
    color: 'from-purple-500 to-indigo-500'
  }
];

export function Features() {
  const [currentWinner, setCurrentWinner] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWinner((prev) => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Overview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:text-center mb-20"
        >
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            GAIAthon 2025 Overview
          </p>
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">About the Challenge</h4>
                <p className="text-gray-600 leading-relaxed">
                  Edenway Foundation proudly presents GAIAthon '25, the second edition of its transformative innovation challenge, running from January to August 2025. Building on the success of GAIAthon '24, this incubation challenge invites universities across Africa to develop compelling solutions to address environmental challenges on the continent.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">Technology & Partnerships</h4>
                <p className="text-gray-600 leading-relaxed">
                  In partnership with the GMES & Africa programme under the African Union Commission and supported by the European Commission, GAIAthon '25 leverages cutting-edge technologies, including Artificial Intelligence (AI), Internet of Things (IoT), and Earth Observation (EO), to foster innovation and collaboration for sustainable development.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">GAIAthon'25 Categories</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  onMouseEnter={() => setHoveredCategory(index)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative group"
                >
                  <div className="h-full bg-white rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />
                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between">
                        <Icon className="h-8 w-8 text-gray-900" />
                        <ArrowRightIcon className={`h-5 w-5 transform transition-transform duration-300 ${
                          hoveredCategory === index ? 'translate-x-1 opacity-100' : 'opacity-0'
                        }`} />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900">{category.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Winners Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">GAIAthon'24 Winners</h3>
          <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <motion.div 
              className="absolute inset-0"
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 0.5 }}
              key={currentWinner}
            >
              <div className="relative h-full">
                <Image
                  src={winners[currentWinner].image}
                  alt={winners[currentWinner].name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h4 className="text-white text-xl font-bold">{winners[currentWinner].name}</h4>
                  <p className="text-gray-200">{winners[currentWinner].project}</p>
                </div>
              </div>
            </motion.div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {winners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentWinner 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onClick={() => setCurrentWinner(index)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 