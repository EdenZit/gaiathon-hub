import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Platforms and Interactive Applications | GAIAthon',
  description: 'Develop interactive web or mobile application that processes and visualizes EO and IoT data.',
};

const DigitalPlatformsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-navy-700 mb-6">
        Digital Platforms and Interactive Applications
      </h1>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-8">
          Develop interactive web or mobile application that processes and visualizes EO and IoT data 
          to support environmental monitoring, disaster response, or resource management.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-navy-600 mb-4">
            📌 Example Use Cases
          </h2>
          <ul className="space-y-4 list-disc pl-6">
            <li className="text-gray-700">
              <span className="font-semibold">Flood Risk Early Warning App:</span> Uses satellite 
              precipitation data to notify communities of rising flood risks.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Precision Agriculture Assistant:</span> Helps farmers 
              optimize irrigation and monitor crop health using EO-based NDVI indices.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Air Quality Monitoring Platform:</span> Displays 
              real-time pollution levels using IoT-based satellite aerosol data.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-navy-600 mb-4">
            📌 Submission Requirements
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A working web or mobile application
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A GitHub repository containing source code and documentation
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A 5-minute video explaining functionality, data sources, and implementation
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DigitalPlatformsPage; 