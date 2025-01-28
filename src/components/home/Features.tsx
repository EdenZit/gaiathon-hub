'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const winners = [
  { id: 1, name: 'Team EcoWatch', project: 'Coastal Monitoring System', image: '/images/winners/team1.jpg' },
  { id: 2, name: 'AquaGuard', project: 'Water Quality Analysis', image: '/images/winners/team2.jpg' },
  { id: 3, name: 'GreenSense', project: 'Forest Cover Tracking', image: '/images/winners/team3.jpg' },
  { id: 4, name: 'AgriTech', project: 'Crop Yield Prediction', image: '/images/winners/team4.jpg' },
  { id: 5, name: 'UrbanPulse', project: 'Urban Heat Mapping', image: '/images/winners/team5.jpg' },
  { id: 6, name: 'ClimateAI', project: 'Climate Change Analysis', image: '/images/winners/team6.jpg' },
  { id: 7, name: 'EarthSense', project: 'Soil Health Monitoring', image: '/images/winners/team7.jpg' },
];

export function Features() {
  const [currentWinner, setCurrentWinner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentWinner((prev) => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Overview Section */}
        <div className="lg:text-center mb-20">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            GAIAthon 2025 Overview
          </p>
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 shadow-lg">
            <div className="grid gap-8">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">About the Challenge</h4>
                <p className="text-gray-600 leading-relaxed">
                  Edenway Foundation proudly presents GAIAthon '25, the second edition of its transformative innovation challenge, running from January to August 2025. Building on the success of GAIAthon '24, this incubation challenge invites universities across Africa to develop compelling solutions to address environmental challenges on the continent.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Technology & Partnerships</h4>
                <p className="text-gray-600 leading-relaxed">
                  In partnership with the GMES & Africa programme under the African Union Commission and supported by the European Commission, GAIAthon '25 leverages cutting-edge technologies, including Artificial Intelligence (AI), Internet of Things (IoT), and Earth Observation (EO), to foster innovation and collaboration for sustainable development.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Winners Showcase */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">GAIAthon'24 Winners</h3>
          <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 transition-opacity duration-1000">
              <div className="relative h-full">
                <Image
                  src={winners[currentWinner].image}
                  alt={winners[currentWinner].name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h4 className="text-white text-xl font-bold">{winners[currentWinner].name}</h4>
                  <p className="text-gray-200">{winners[currentWinner].project}</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {winners.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentWinner ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentWinner(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Prizes Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">GAIAthon'25 Prizes</h3>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Grand Prizes</h4>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-2">1st</span>
                    <span>$10,000 + Incubation Support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-2">2nd</span>
                    <span>$7,000 + Technical Mentorship</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600 mr-2">3rd</span>
                    <span>$5,000 + Development Resources</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Additional Benefits</h4>
                <ul className="space-y-3 text-gray-600">
                  <li>• Access to High-Performance Computing Resources</li>
                  <li>• Professional Networking Opportunities</li>
                  <li>• Industry Expert Mentorship</li>
                  <li>• Publication Opportunities</li>
                  <li>• International Conference Participation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 