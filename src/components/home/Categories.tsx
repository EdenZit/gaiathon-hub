'use client';

import React from 'react';
import Link from 'next/link';
import { FaLaptopCode, FaMicrochip, FaMapLocation } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const categories = [
  {
    id: 'digital-platforms',
    title: 'Digital Platforms and Interactive Applications',
    icon: FaLaptopCode,
    description: 'Develop interactive web or mobile applications that process and visualize EO and IoT data.',
    href: '/categories/digital-platforms',
    gradient: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    id: 'iot-systems',
    title: 'IoT-Enabled Smart Systems',
    icon: FaMicrochip,
    description: 'Build physical prototypes that collect real-time environmental data using low-cost IoT sensors.',
    href: '/categories/iot-systems',
    gradient: 'from-emerald-500/10 to-green-500/10'
  },
  {
    id: 'geospatial-intelligence',
    title: 'Geospatial Intelligence and Policy Innovation',
    icon: FaMapLocation,
    description: 'Analyze satellite data to generate maps, reports, and geospatial models for environmental monitoring.',
    href: '/categories/geospatial-intelligence',
    gradient: 'from-purple-500/10 to-indigo-500/10'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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

export function Categories() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            GAIAthon&apos;25 Categories
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose your innovation track and make an impact
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={category.href}
              className="block transform transition-transform duration-300 hover:scale-[1.02]"
            >
              <motion.div
                variants={itemVariants}
                className="relative group h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-xl`} />
                <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden p-6 transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg mb-4">
                    <category.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600">
                    {category.description}
                  </p>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-blue-600 font-medium flex items-center">
                      Learn more 
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 