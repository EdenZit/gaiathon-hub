'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Categories } from '@/components/home/Categories';
import { Partners } from '@/components/home/Partners';
import { 
  DevicePhoneMobileIcon, 
  CpuChipIcon, 
  GlobeAltIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
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

const highlights = [
  {
    icon: ChartBarIcon,
    title: 'Innovation Focus',
    description: 'Develop solutions using AI, IoT, and Earth Observation technologies',
  },
  {
    icon: UserGroupIcon,
    title: 'Expert Mentorship',
    description: 'Get guidance from industry leaders and technical experts',
  },
  {
    icon: AcademicCapIcon,
    title: 'Learning Resources',
    description: 'Access specialized training and development resources',
  },
];

export function Features() {
  const [currentWinner, setCurrentWinner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWinner((prev) => (prev + 1) % winners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white">
      {/* Overview Section */}
      <div className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
                The Challenge
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
                GAIAthon 2025 Overview
              </p>
              <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
                Join us in shaping the future of Earth Observation technology and environmental innovation.
              </p>
            </motion.div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur" />
                    <div className="relative bg-white p-8 rounded-lg shadow-lg">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Categories />
      </motion.div>

      {/* Winners Showcase */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">
              GAIAthon'24 Winners
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Celebrating innovative solutions from our previous hackathon
            </p>
          </motion.div>

          <div className="relative">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {winners[currentWinner].name}
                    </h3>
                    <p className="text-lg text-gray-200">
                      {winners[currentWinner].project}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

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
        </div>
      </div>

      {/* Partners Section */}
      <Partners />
    </div>
  );
} 