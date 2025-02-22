import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Geospatial Intelligence and Policy Innovation | GAIAthon',
  description: 'Analyze satellite data to generate maps, reports, and geospatial models for environmental monitoring.',
};

const GeospatialIntelligencePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-navy-700 mb-6">
        Geospatial Intelligence and Policy Innovation
      </h1>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-8">
          Analyze satellite data to generate maps, reports, and geospatial models for environmental 
          monitoring and policy recommendations.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-navy-600 mb-4">
            📌 Example Use Cases
          </h2>
          <ul className="space-y-4 list-disc pl-6">
            <li className="text-gray-700">
              <span className="font-semibold">Deforestation and Land Degradation Risk Map:</span> Uses 
              multispectral satellite imagery to assess vegetation loss and provide recommendations for 
              reforestation.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Flood Vulnerability Assessment:</span> Uses EO-based 
              floodplain mapping to identify high-risk areas and propose flood mitigation strategies.
            </li>
            <li className="text-gray-700">
              <span className="font-semibold">Coastal Erosion Monitoring Report:</span> Analyze 
              shoreline changes using Sentinel-1 radar data and recommends adaptation measures for 
              coastal communities.
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
              A GIS-based report (including analysis, maps, and insights)
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A time-series visualization or interactive map (if applicable)
            </li>
            <li className="flex items-start">
              <span className="text-navy-600 mr-2">🔹</span>
              A 5-minute video explaining methodology and key findings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeospatialIntelligencePage; 