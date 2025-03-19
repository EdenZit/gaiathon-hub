'use client';

import React from 'react';
import { motion } from 'framer-motion';

const useCases = [
  {
    title: 'Urban Air Pollution Heatmap',
    description: 'Uses satellite-based NO₂ and PM2.5 concentration data to identify pollution hotspots and propose mitigation measures.',
  },
  {
    title: 'Drought Risk Assessment Map',
    description: 'Integrates EO-derived soil moisture data with rainfall anomalies to support early drought response.',
  },
  {
    title: 'Mangrove Ecosystem Health Analysis',
    description: 'Uses EO-based vegetation indices to assess mangrove degradation and recommend conservation strategies.',
  },
  {
    title: 'Illegal Mining Detection Map',
    description: 'Employs EO-based spectral analysis to identify unregulated mining activities and their environmental impact.',
  },
  {
    title: 'Climate Migration Predictive Model',
    description: 'Uses historical EO-based climate trends to assess population displacement risks due to environmental changes.',
  },
  {
    title: 'Urban Sprawl Impact Report',
    description: 'Analyzes EO-based land-use changes to recommend policies for sustainable city expansion and green space preservation.',
  },
  {
    title: 'Wetland Conservation Priority Map',
    description: 'Identifies critical wetlands using SAR satellite data and proposes conservation zones to protect biodiversity.',
  },
  {
    title: 'Groundwater Depletion Risk Assessment',
    description: 'Combines GRACE satellite data and well-level IoT sensors to map aquifer stress and recommend extraction limits.',
  },
  {
    title: 'Invasive Species Spread Model',
    description: 'Uses multispectral imagery to track invasive plant species (e.g., water hyacinth) and prioritize eradication efforts.',
  },
  {
    title: 'Artisanal Mining Impact Dashboard',
    description: 'Maps illegal mining sites via high-resolution EO data and proposes rehabilitation strategies for degraded land.',
  },
  {
    title: 'Malaria Outbreak Prediction Tool',
    description: 'Correlates satellite vegetation/rainfall data with IoT mosquito trap counts to forecast disease hotspots and allocate health resources.',
  },
  {
    title: 'Carbon Footprint Tracker for Cities',
    description: 'Displays urban carbon emissions using satellite CO2 maps and IoT air quality sensors, with recommendations for green policies.',
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

const GeospatialIntelligencePage = () => {
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
            Geospatial Intelligence and Policy Innovation
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-xl text-gray-700 mb-12">
              Analyze satellite data to generate maps, reports, and geospatial models that inform 
              environmental policy decisions and support conservation efforts.
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
                    className="p-4 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors duration-300"
                  >
                    <h3 className="font-semibold text-indigo-600 mb-2">
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
                  <span className="text-indigo-600 mr-3">🔹</span>
                  <span>A web-based interactive visualization or dashboard showcasing your geospatial analysis</span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-indigo-600 mr-3">🔹</span>
                  <span>A synthesis report that presents analysis of a specific situation using Earth Observation data, supported by graphs or maps that provide the necessary evidence for their policy proposal.</span>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-start bg-gray-50 p-4 rounded-lg"
                >
                  <span className="text-indigo-600 mr-3">🔹</span>
                  <span>A 5-minute video demonstrating your solution's features and potential impact</span>
                </motion.li>
              </motion.ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GeospatialIntelligencePage; 