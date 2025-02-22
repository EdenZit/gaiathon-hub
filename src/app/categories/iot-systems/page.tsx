import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IoT-Enabled Smart Systems | GAIAthon',
  description: 'Build physical prototypes that collect real-time environmental data using low-cost IoT sensors.',
};

const IoTSystemsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-navy-700 mb-6">
        IoT-Enabled Smart Systems
      </h1>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-8">
          Build physical prototypes that collect real-time environmental data using low-cost IoT sensors, 
          integrated with a digital dashboard for visualization and analysis.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-navy-600 mb-4">
            📌 Example Use Cases
          </h2>
          <ul className="space-y-4 list-disc pl-6">
            <li className="text-gray-700">
              <span className="font-semibold">Smart Buoy for Marine Pollution Monitoring:</span> A buoy 
              with temperature and turbidity sensors that transmits real-time data to a dashboard for 
              pollution tracking.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Urban Heat Island Monitoring Device:</span> A network of 
              temperature and humidity sensors that display heat zone data on a web-based dashboard.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Forest Fire Detection System:</span> An IoT-based early 
              warning system with temperature and smoke sensors, linked to a satellite thermal map for 
              hotspot detection.
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
              A functional IoT prototype (demonstrated in a video)
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A dashboard (web-based or local interface) for data visualization
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A GitHub repository with circuit diagrams and code
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A 5-minute video explaining device functionality and data collection
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IoTSystemsPage; 