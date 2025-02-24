'use client';

import React from 'react';
import Link from 'next/link';
import { FaLaptopCode, FaMicrochip, FaMapLocation } from 'react-icons/fa6';
import { MotionDiv } from '@/components/motion';

const categories = [
  {
    id: 'digital-platforms',
    title: 'Digital Platforms and Interactive Applications',
    icon: FaLaptopCode,
    description: 'Develop interactive web or mobile applications that process and visualize EO and IoT data.',
    href: '/categories/digital-platforms',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500',
  },
  {
    id: 'iot-systems',
    title: 'IoT-Enabled Smart Systems',
    icon: FaMicrochip,
    description: 'Build physical prototypes that collect real-time environmental data using low-cost IoT sensors.',
    href: '/categories/iot-systems',
    gradient: 'from-emerald-500 to-green-500',
    iconBg: 'bg-emerald-500',
  },
  {
    id: 'geospatial-intelligence',
    title: 'Geospatial Intelligence and Policy Innovation',
    icon: FaMapLocation,
    description: 'Analyze satellite data to generate maps, reports, and geospatial models for environmental monitoring.',
    href: '/categories/geospatial-intelligence',
    gradient: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-500',
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
    <section id="innovation-tracks" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Innovation Tracks
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Choose your path and make a lasting impact on environmental sustainability
            </p>
          </MotionDiv>
        </div>

        <MotionDiv
          className="grid grid-cols-1 gap-12 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category, index) => (
            <MotionDiv
              key={category.id}
              variants={itemVariants}
              className="relative group"
            >
              <Link 
                href={category.href}
                className="block"
              >
                <div className="relative">
                  {/* Gradient Background */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
                  
                  {/* Content */}
                  <div className="relative bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl">
                    {/* Icon */}
                    <div className={`inline-flex p-3 rounded-lg ${category.iconBg} text-white shadow-lg mb-6`}>
                      <category.icon className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-green-600 transition-all duration-300">
                      {category.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {category.description}
                    </p>

                    {/* Learn More Link */}
                    <div className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-green-600 transition-colors duration-300">
                      Learn more
                      <svg
                        className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </MotionDiv>
          ))}
        </MotionDiv>
      </div>
    </section>
  );
} 