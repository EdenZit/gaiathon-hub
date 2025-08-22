'use client';

import { motion } from 'framer-motion';
import { Categories } from '@/components/home/Categories';
import { Partners } from '@/components/home/Partners';
import { Winners } from './Winners';
import { 
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

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
  return (
    <div className="relative overflow-hidden">
      {/* Winners Section */}
      <Winners />

      {/* Innovation Tracks Section */}
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

      {/* Partners Section */}
      <Partners />
    </div>
  );
} 