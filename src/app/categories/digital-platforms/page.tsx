'use client';

import React from 'react';
import { motion } from 'framer-motion';

const useCases = [
  {
    title: 'Wildfire Tracking Dashboard',
    description: 'Integrates IoT fire sensors with EO-based thermal imaging to monitor and forecast wildfire spread.',
  },
  {
    title: 'Water Quality Assessment Tool',
    description: 'Utilizes satellite-derived chlorophyll and turbidity data to monitor freshwater bodies and drinking water sources.',
  },
  {
    title: 'Biodiversity Monitoring Web App',
    description: 'Uses EO-based habitat mapping to track wildlife migration patterns and conservation efforts.',
  },
  {
    title: 'Energy Consumption Optimization App',
    description: 'Uses satellite-derived solar potential data to help communities optimize renewable energy use.',
  },
  {
    title: 'Urban Expansion Analysis Dashboard',
    description: 'Integrates EO-based land use classification with real-time construction monitoring to track urban sprawl.',
  },
  {
    title: 'Climate Impact Data Portal',
    description: 'Aggregates EO-based climate variables (temperature, humidity, CO₂ levels) and presents interactive trend analyses.',
  },
  {
    title: 'Drought Prediction Tool',
    description: 'Integrates satellite soil moisture data and IoT-enabled weather stations to forecast drought conditions and recommend water conservation strategies.',
  },
  {
    title: 'Waste Management Optimizer',
    description: 'Maps illegal dumpsites via EO imagery and IoT waste-bin sensors to optimize municipal collection routes.',
  },
  {
    title: 'Renewable Energy Site Planner',
    description: 'Uses satellite wind/solar irradiance data and IoT ground sensors to identify optimal locations for solar/wind farms.',
  },
  {
    title: 'Wildlife Corridor Tracker',
    description: 'Visualizes animal migration patterns using satellite tracking collars and EO-based habitat fragmentation maps.',
  },
  {
    title: 'Soil Erosion Alert System',
    description: 'Combines radar satellite data (Sentinel-1) and IoT soil moisture sensors to predict erosion risks in farmlands.',
  },
  {
    title: 'Water Scarcity Dashboard',
    description: 'Aggregates EO-based groundwater level maps and IoT river flow sensors to prioritize water distribution in arid regions.',
  },
  {
    title: 'OR ANY RELATED TOPIC OF YOUR CHOICE',
    description: 'Have an innovative idea that combines Earth Observation data with interactive visualization? We welcome your creative solutions!',
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

const DigitalPlatformsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Digital Platforms and Interactive Applications
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-xl text-gray-700 mb-12">
              Develop interactive web or mobile applications that process and visualize EO and IoT data 
              to support environmental monitoring, disaster response, or resource management.
            </p>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                📌 Example Use Cases
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6"
              >
                {useCases.map((useCase, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="p-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors duration-300"
                  >
                    <h3 className="font-semibold text-blue-600 mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-700">
                      {useCase.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                📌 Submission Requirements
              </h2>
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-blue-600 mr-3">🔹</span>
                  <span>A working web or mobile application with interactive features and real-time data visualization</span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-blue-600 mr-3">🔹</span>
                  <span>A GitHub repository containing well-documented source code, setup instructions, and API documentation</span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-blue-600 mr-3">🔹</span>
                  <span>A 5-minute video demonstration showcasing the application's functionality, data sources, and implementation details</span>
                </motion.li>
              </motion.ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DigitalPlatformsPage; 