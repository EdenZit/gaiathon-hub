'use client';

import React from 'react';
import { motion } from 'framer-motion';

const useCases = [
  {
    title: 'Smart Irrigation Controller',
    description: 'An IoT-based soil moisture and weather sensor system that automates irrigation based on EO-derived climate forecasts.',
  },
  {
    title: 'Landslide Prediction Sensor Network',
    description: 'Uses soil moisture, vibration, and rainfall sensors to detect early warning signs of landslides.',
  },
  {
    title: 'Coastal Water Salinity Monitoring System',
    description: 'A floating IoT device that tracks salinity variations in coastal zones, helping to manage freshwater supply.',
  },
  {
    title: 'Methane Gas Detection Sensor for Landfills',
    description: 'A low-cost IoT device that measures methane emissions to support waste management policies.',
  },
  {
    title: 'Smart Coral Reef Health Monitoring System',
    description: 'Deploys underwater IoT sensors to track temperature, pH levels, and coral bleaching risks.',
  },
  {
    title: 'IoT-Based Renewable Energy Tracker',
    description: 'Monitors solar and wind energy generation and usage patterns in remote communities.',
  },
  {
    title: 'Automated Water Level Gauge for Flood Prediction',
    description: 'An IoT sensor network that measures river and lake water levels, alerting communities of flood risks.',
  },
  {
    title: 'Smart Beehive for Pollinator Health',
    description: 'Monitors hive temperature, humidity, and activity via IoT sensors to assess ecosystem health and combat colony collapse.',
  },
  {
    title: 'River Water Quality Tracker',
    description: 'Deploys floating IoT sensors to measure pH, dissolved oxygen, and turbidity, transmitting data to a dashboard for pollution alerts.',
  },
  {
    title: 'Noise Pollution Meter Network',
    description: 'IoT sound sensors placed in urban areas to map noise levels and recommend zoning policies for quieter cities.',
  },
  {
    title: 'Aquaculture Health Monitor',
    description: 'IoT water quality sensors in fish farms to detect ammonia spikes and oxygen depletion, linked to a farmer alert system.',
  },
  {
    title: 'Solar Panel Efficiency Optimizer',
    description: 'IoT sensors on solar arrays to monitor dust build-up and tilt angles, with AI-driven cleaning/maintenance recommendations.',
  },
  {
    title: 'OR ANY RELATED TOPIC OF YOUR CHOICE',
    description: 'Have an innovative idea that combines IoT sensors with environmental monitoring? We welcome your creative solutions!',
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

const IoTSystemsPage = () => {
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
            IoT-Enabled Smart Systems
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-xl text-gray-700 mb-12">
              Build physical prototypes that collect real-time environmental data using low-cost IoT sensors 
              to support environmental monitoring and resource management.
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
                    className="p-4 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors duration-300"
                  >
                    <h3 className="font-semibold text-emerald-600 mb-2">
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
                  <span className="text-emerald-600 mr-3">🔹</span>
                  <span>A working IoT prototype with sensors and data collection capabilities</span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-emerald-600 mr-3">🔹</span>
                  <span>A GitHub repository containing hardware schematics, firmware code, and setup instructions</span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-emerald-600 mr-3">🔹</span>
                  <span>A 5-minute video demonstration showcasing the prototype's functionality, data collection, and real-world application</span>
                </motion.li>
              </motion.ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IoTSystemsPage; 